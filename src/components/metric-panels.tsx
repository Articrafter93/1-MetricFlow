"use client";

import { useEffect, useMemo, useState } from "react";
import { CohortHeatmap } from "@/components/dashboard/cohort-heatmap";
import { FunnelOverview } from "@/components/dashboard/funnel-overview";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import type { MetricsRange, MetricsResponse } from "@/lib/metrics";

type MetricPanelsProps = {
  tenantSlug: string;
  workspaceName: string;
  initialData: MetricsResponse;
};

export function MetricPanels({
  tenantSlug,
  workspaceName,
  initialData,
}: MetricPanelsProps) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState<MetricsRange>(initialData.range);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);

  const queryString = useMemo(() => {
    const query = new URLSearchParams({ range });
    if (range === "custom" && customFrom && customTo) {
      query.set("from", customFrom);
      query.set("to", customTo);
    }
    return query.toString();
  }, [customFrom, customTo, range]);

  const canFetchMetrics = range !== "custom" || (customFrom && customTo);

  useEffect(() => {
    if (!canFetchMetrics) {
      return;
    }

    let cancelled = false;
    async function fetchMetrics() {
      setLoading(true);
      const response = await fetch(
        `/api/tenants/${tenantSlug}/metrics/live?${queryString}`,
        { cache: "no-store" },
      );

      if (!response.ok || cancelled) {
        setLoading(false);
        return;
      }

      const json = (await response.json()) as MetricsResponse;
      setData(json);
      setLoading(false);
    }

    void fetchMetrics();

    const interval = setInterval(() => {
      void fetchMetrics();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canFetchMetrics, queryString, tenantSlug]);

  return (
    <section className="space-y-4">
      <header className="glass-panel p-4">
        <p className="text-xs uppercase tracking-wide text-text-secondary">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">{workspaceName}</h1>
      </header>

      {loading ? <div className="skeleton-block h-16 w-full rounded-xl" /> : null}
      <KpiCards summary={data.summary} />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <RevenueChart
          points={data.points}
          range={range}
          customFrom={customFrom}
          customTo={customTo}
          onRangeChange={setRange}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
        <RecentActivity events={data.recentActivity} />
      </div>

      <FunnelOverview funnel={data.funnel} />
      <CohortHeatmap cohorts={data.cohorts} />
    </section>
  );
}
