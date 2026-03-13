import { subDays } from "date-fns";
import { prisma } from "@/lib/db";

export type MetricsRange = "7d" | "30d" | "90d" | "custom";

export type MetricsQueryInput = {
  range: MetricsRange;
  from?: string;
  to?: string;
  clientId?: string;
};

export type MetricPoint = {
  date: string;
  visits: number;
  leads: number;
  deals: number;
  mrr: number;
  retention: number;
  conversion: number;
  churn: number;
};

export type FunnelSummary = {
  visits: number;
  leads: number;
  deals: number;
  visitToLeadPct: number;
  leadToDealPct: number;
};

export type CohortRow = {
  cohort: string;
  values: number[];
};

export type ActivityEntry = {
  id: string;
  message: string;
  timestamp: string;
};

export type MetricsResponse = {
  range: MetricsRange;
  rangeLabel: string;
  points: MetricPoint[];
  summary: {
    mrr: number;
    mrrDelta: number;
    activeClients: number;
    retentionRate: number;
    churnRate: number;
  };
  funnel: FunnelSummary;
  cohorts: CohortRow[];
  recentActivity: ActivityEntry[];
};

function deterministicNoise(seed: string, min: number, max: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) >>> 0;
  }
  const normalized = hash / 4294967295;
  return min + normalized * (max - min);
}

function getDateRange(input: MetricsQueryInput) {
  const now = new Date();

  if (input.range === "custom") {
    const from = input.from ? new Date(input.from) : subDays(now, 29);
    const to = input.to ? new Date(input.to) : now;

    const startDate = from <= to ? from : to;
    const endDate = from <= to ? to : from;
    return {
      startDate,
      endDate,
      label: `${startDate.toISOString().slice(0, 10)} - ${endDate.toISOString().slice(0, 10)}`,
    };
  }

  const rangeDays = input.range === "7d" ? 7 : input.range === "30d" ? 30 : 90;
  const startDate = subDays(now, rangeDays - 1);
  return {
    startDate,
    endDate: now,
    label: `${input.range.toUpperCase()}`,
  };
}

function buildSamplePoints(
  workspaceId: string,
  startDate: Date,
  endDate: Date,
): MetricPoint[] {
  const spanInDays =
    Math.max(
      1,
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    ) || 1;

  return Array.from({ length: spanInDays }).map((_, index) => {
    const date = subDays(endDate, spanInDays - index - 1);
    const visits =
      900 + index * 28 + Math.round(deterministicNoise(`${workspaceId}-${index}-v`, 10, 180));
    const leads = Math.max(1, Math.round(visits * (0.1 + deterministicNoise(`${index}-l`, 0, 0.06))));
    const deals = Math.max(1, Math.round(leads * (0.18 + deterministicNoise(`${index}-d`, 0, 0.08))));
    const mrr = 12000 + index * 70 + Math.round(deterministicNoise(`${workspaceId}-${index}-m`, 20, 450));
    const retention = 0.85 + deterministicNoise(`${workspaceId}-${index}-r`, 0, 0.12);
    const conversion = leads > 0 ? deals / leads : 0;
    const churn = 1 - retention;

    return {
      date: date.toISOString().slice(0, 10),
      visits,
      leads,
      deals,
      mrr,
      retention,
      conversion,
      churn,
    };
  });
}

export function calculateSummary(points: MetricPoint[], activeClients: number) {
  const firstMrr = points[0]?.mrr ?? 0;
  const lastMrr = points[points.length - 1]?.mrr ?? 0;
  const retentionRate =
    points.length > 0
      ? points.reduce((acc, point) => acc + point.retention, 0) / points.length
      : 0;
  const churnRate =
    points.length > 0
      ? points.reduce((acc, point) => acc + point.churn, 0) / points.length
      : 0;

  return {
    mrr: lastMrr,
    mrrDelta: firstMrr === 0 ? 0 : (lastMrr - firstMrr) / firstMrr,
    activeClients,
    retentionRate,
    churnRate,
  };
}

function buildFunnel(points: MetricPoint[]): FunnelSummary {
  const latest = points[points.length - 1];
  const visits = latest?.visits ?? 0;
  const leads = latest?.leads ?? 0;
  const deals = latest?.deals ?? 0;

  return {
    visits,
    leads,
    deals,
    visitToLeadPct: visits > 0 ? leads / visits : 0,
    leadToDealPct: leads > 0 ? deals / leads : 0,
  };
}

function buildCohorts(points: MetricPoint[]): CohortRow[] {
  const base = points.length > 0 ? points[points.length - 1].retention : 0.82;

  return Array.from({ length: 6 }).map((_, rowIndex) => {
    const monthOffset = 5 - rowIndex;
    const cohortDate = subDays(new Date(), monthOffset * 30);
    const values = Array.from({ length: 8 }).map((__, colIndex) => {
      const value = base - colIndex * 0.08 - rowIndex * 0.03;
      return Math.max(0, Math.min(1, value));
    });

    return {
      cohort: cohortDate.toISOString().slice(0, 7),
      values,
    };
  });
}

function buildRecentActivity(points: MetricPoint[]): ActivityEntry[] {
  return points
    .slice(-6)
    .reverse()
    .map((point, index) => ({
      id: `${point.date}-${index}`,
      message:
        index % 2 === 0
          ? `Actualizacion de KPI diario (${point.date})`
          : `Nuevo cierre de embudo detectado (${point.deals} deals)`,
      timestamp: point.date,
    }));
}

export async function getWorkspaceMetrics(
  workspaceId: string,
  input: MetricsQueryInput,
): Promise<MetricsResponse> {
  const range = getDateRange(input);

  const snapshots = await prisma.metricSnapshot.findMany({
    where: {
      workspaceId,
      metricDate: {
        gte: range.startDate,
        lte: range.endDate,
      },
      ...(input.clientId ? { clientAccountId: input.clientId } : {}),
    },
    orderBy: { metricDate: "asc" },
    select: {
      metricDate: true,
      funnelVisits: true,
      funnelLeads: true,
      funnelDeals: true,
      mrr: true,
      retentionRate: true,
      conversionRate: true,
      churnRate: true,
      clientAccountId: true,
    },
  });

  const points =
    snapshots.length > 0
      ? snapshots.map((snapshot) => ({
          date: snapshot.metricDate.toISOString().slice(0, 10),
          visits: snapshot.funnelVisits,
          leads: snapshot.funnelLeads,
          deals: snapshot.funnelDeals,
          mrr: Number(snapshot.mrr),
          retention: snapshot.retentionRate,
          conversion: snapshot.conversionRate,
          churn: snapshot.churnRate,
        }))
      : buildSamplePoints(workspaceId, range.startDate, range.endDate);

  const activeClients = input.clientId
    ? 1
    : snapshots.length > 0
      ? new Set(
          snapshots
            .map((snapshot) => snapshot.clientAccountId)
            .filter((value): value is string => Boolean(value)),
        ).size
      : await prisma.clientAccount.count({ where: { workspaceId } });

  return {
    range: input.range,
    rangeLabel: range.label,
    points,
    summary: calculateSummary(points, activeClients),
    funnel: buildFunnel(points),
    cohorts: buildCohorts(points),
    recentActivity: buildRecentActivity(points),
  };
}

