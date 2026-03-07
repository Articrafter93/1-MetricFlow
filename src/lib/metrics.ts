import { subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";

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

export type MetricsResponse = {
  points: MetricPoint[];
  summary: {
    mrr: number;
    mrrDelta: number;
    retention: number;
    conversion: number;
  };
};

function deterministicNoise(seed: string, min: number, max: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const normalized = hash / 4294967295;
  return min + normalized * (max - min);
}

function sampleMetrics(workspaceId: string, days: number): MetricsResponse {
  const points: MetricPoint[] = Array.from({ length: days }).map((_, index) => {
    const day = subDays(new Date(), days - index - 1);
    const visits =
      1200 +
      index * 25 +
      Math.round(deterministicNoise(`${workspaceId}-${index}-visits`, 10, 220));
    const leads = Math.round(visits * 0.12);
    const deals = Math.round(leads * 0.24);
    const mrr =
      20000 +
      index * 45 +
      Math.round(deterministicNoise(`${workspaceId}-${index}-mrr`, 20, 560));
    const retention =
      0.9 + deterministicNoise(`${workspaceId}-${index}-retention`, -0.015, 0.035);
    const conversion = leads > 0 ? deals / leads : 0;
    const churn = 1 - retention;

    return {
      date: day.toISOString().slice(0, 10),
      visits,
      leads,
      deals,
      mrr,
      retention,
      conversion,
      churn,
    };
  });

  const firstMrr = points[0]?.mrr ?? 0;
  const lastMrr = points[points.length - 1]?.mrr ?? 0;

  return {
    points,
    summary: {
      mrr: lastMrr,
      mrrDelta: firstMrr === 0 ? 0 : (lastMrr - firstMrr) / firstMrr,
      retention: points.reduce((acc, item) => acc + item.retention, 0) / points.length,
      conversion: points.reduce((acc, item) => acc + item.conversion, 0) / points.length,
    },
  };
}

export async function getWorkspaceMetrics(
  workspaceId: string,
  days: number,
): Promise<MetricsResponse> {
  const safeDays = Math.max(7, Math.min(days, 365));

  if (isMockDatabaseEnabled()) {
    return sampleMetrics(workspaceId, safeDays);
  }

  const startDate = subDays(new Date(), safeDays - 1);

  const snapshots = await prisma.metricSnapshot.findMany({
    where: {
      workspaceId,
      metricDate: { gte: startDate },
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
    },
  });

  if (snapshots.length === 0) {
    return sampleMetrics(workspaceId, safeDays);
  }

  const points: MetricPoint[] = snapshots.map((snapshot) => ({
    date: snapshot.metricDate.toISOString().slice(0, 10),
    visits: snapshot.funnelVisits,
    leads: snapshot.funnelLeads,
    deals: snapshot.funnelDeals,
    mrr: Number(snapshot.mrr),
    retention: snapshot.retentionRate,
    conversion: snapshot.conversionRate,
    churn: snapshot.churnRate,
  }));

  const firstMrr = points[0]?.mrr ?? 0;
  const lastMrr = points[points.length - 1]?.mrr ?? 0;

  return {
    points,
    summary: {
      mrr: lastMrr,
      mrrDelta: firstMrr === 0 ? 0 : (lastMrr - firstMrr) / firstMrr,
      retention: points.reduce((acc, item) => acc + item.retention, 0) / points.length,
      conversion: points.reduce((acc, item) => acc + item.conversion, 0) / points.length,
    },
  };
}
