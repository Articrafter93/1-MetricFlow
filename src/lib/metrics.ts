import { subDays } from "date-fns";
import { DEMO_CLIENT, DEMO_WORKSPACE, getDemoWorkspaceMetrics } from "@/lib/demo-mode";
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
    activeClientsDelta: number;
    retentionRate: number;
    retentionDelta: number;
    churnRate: number;
    churnDelta: number;
  };
  funnel: FunnelSummary;
  cohorts: CohortRow[];
  recentActivity: ActivityEntry[];
};

export class MetricsAccessError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MetricsAccessError";
    this.status = status;
  }
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

function safeDelta(current: number, previous: number) {
  if (previous === 0) {
    return 0;
  }
  return (current - previous) / previous;
}

export function calculateSummary(
  points: MetricPoint[],
  activeClients: number,
  previousActiveClients = activeClients,
) {
  const first = points[0];
  const last = points[points.length - 1];

  const firstMrr = first?.mrr ?? 0;
  const lastMrr = last?.mrr ?? 0;
  const firstRetention = first?.retention ?? 0;
  const lastRetention = last?.retention ?? 0;
  const firstChurn = first?.churn ?? 0;
  const lastChurn = last?.churn ?? 0;

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
    mrrDelta: safeDelta(lastMrr, firstMrr),
    activeClients,
    activeClientsDelta: safeDelta(activeClients, previousActiveClients),
    retentionRate,
    retentionDelta: lastRetention - firstRetention,
    churnRate,
    churnDelta: lastChurn - firstChurn,
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
  if (points.length === 0) {
    return [];
  }

  const base = points[points.length - 1].retention;

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
  if (points.length === 0) {
    return [];
  }

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

async function ensureClientInWorkspace(workspaceId: string, clientId: string) {
  const clientCount = await prisma.clientAccount.count({
    where: {
      id: clientId,
      workspaceId,
    },
  });

  if (clientCount === 0) {
    throw new MetricsAccessError(
      403,
      "Client does not belong to the requested workspace.",
    );
  }
}

function deriveActiveClientDeltas(
  clientIds: Array<string | null>,
  fallbackActiveClients: number,
) {
  const validIds = clientIds.filter((value): value is string => Boolean(value));
  if (validIds.length === 0) {
    return {
      activeClients: fallbackActiveClients,
      previousActiveClients: fallbackActiveClients,
    };
  }

  const splitIndex = Math.max(1, Math.floor(validIds.length / 2));
  const previousSlice = validIds.slice(0, splitIndex);
  const currentSlice = validIds.slice(splitIndex);

  const previousActiveClients = new Set(previousSlice).size;
  const currentActiveClients =
    currentSlice.length > 0 ? new Set(currentSlice).size : previousActiveClients;

  return {
    activeClients: currentActiveClients,
    previousActiveClients,
  };
}

export async function getWorkspaceMetrics(
  workspaceId: string,
  input: MetricsQueryInput,
): Promise<MetricsResponse> {
  if (workspaceId === DEMO_WORKSPACE.id) {
    if (input.clientId && input.clientId !== DEMO_CLIENT.id) {
      throw new MetricsAccessError(
        403,
        "Client does not belong to the requested workspace.",
      );
    }

    return getDemoWorkspaceMetrics(input);
  }

  const range = getDateRange(input);

  if (input.clientId) {
    await ensureClientInWorkspace(workspaceId, input.clientId);
  }

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

  const points = snapshots.map((snapshot) => ({
    date: snapshot.metricDate.toISOString().slice(0, 10),
    visits: snapshot.funnelVisits,
    leads: snapshot.funnelLeads,
    deals: snapshot.funnelDeals,
    mrr: Number(snapshot.mrr),
    retention: snapshot.retentionRate,
    conversion: snapshot.conversionRate,
    churn: snapshot.churnRate,
  }));

  const activeClients = input.clientId
    ? 1
    : snapshots.length > 0
      ? new Set(
          snapshots
            .map((snapshot) => snapshot.clientAccountId)
            .filter((value): value is string => Boolean(value)),
        ).size
      : await prisma.clientAccount.count({ where: { workspaceId } });

  const { previousActiveClients } = deriveActiveClientDeltas(
    snapshots.map((snapshot) => snapshot.clientAccountId),
    activeClients,
  );

  return {
    range: input.range,
    rangeLabel: range.label,
    points,
    summary: calculateSummary(points, activeClients, previousActiveClients),
    funnel: buildFunnel(points),
    cohorts: buildCohorts(points),
    recentActivity: buildRecentActivity(points),
  };
}
