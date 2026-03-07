"use client";

import { useEffect, useMemo, useState } from "react";
import type { Role } from "@prisma/client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricsResponse } from "@/lib/metrics";
import { ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

type MetricPanelsProps = {
  workspaceName: string;
  role: Role;
  initialData: MetricsResponse;
};

const ranges = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function MetricPanels({ workspaceName, role, initialData }: MetricPanelsProps) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<MetricsResponse>(initialData);
  const [expandedCard, setExpandedCard] = useState<"mrr" | "funnel" | "retention" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      setLoading(true);
      const response = await fetch(`/api/metrics/live?days=${days}`, {
        cache: "no-store",
      });

      if (!response.ok || cancelled) {
        setLoading(false);
        return;
      }

      const json = (await response.json()) as MetricsResponse;
      setData(json);
      setLoading(false);
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [days]);

  const deltas = useMemo(
    () => ({
      mrr: `${data.summary.mrrDelta >= 0 ? "+" : ""}${(data.summary.mrrDelta * 100).toFixed(1)}%`,
      retention: `${(data.summary.retention * 100).toFixed(1)}%`,
      conversion: `${(data.summary.conversion * 100).toFixed(1)}%`,
    }),
    [data],
  );

  return (
    <section className="space-y-6">
      <div className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{workspaceName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Role: <span className="text-slate-200">{ROLE_LABELS[role]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ranges.map((range) => (
            <button
              key={range.label}
              type="button"
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition",
                days === range.days
                  ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
                  : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500",
              )}
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <button
          type="button"
          className="metric-card text-left"
          onClick={() => setExpandedCard(expandedCard === "mrr" ? null : "mrr")}
        >
          <p className="metric-label">MRR</p>
          <p className="metric-value">${Math.round(data.summary.mrr).toLocaleString()}</p>
          <p className="metric-delta">{deltas.mrr}</p>
        </button>

        <button
          type="button"
          className="metric-card text-left"
          onClick={() => setExpandedCard(expandedCard === "funnel" ? null : "funnel")}
        >
          <p className="metric-label">Embudo de conversion</p>
          <p className="metric-value">
            {data.points.at(-1)?.visits ?? 0} / {data.points.at(-1)?.leads ?? 0} /{" "}
            {data.points.at(-1)?.deals ?? 0}
          </p>
          <p className="metric-delta">Visitas / Leads / Deals</p>
        </button>

        <button
          type="button"
          className="metric-card text-left"
          onClick={() => setExpandedCard(expandedCard === "retention" ? null : "retention")}
        >
          <p className="metric-label">Retencion + Conversion</p>
          <p className="metric-value">
            {deltas.retention} / {deltas.conversion}
          </p>
          <p className="metric-delta">Promedio del periodo</p>
        </button>
      </div>

      <div
        className={cn(
          "expand-panel overflow-hidden transition-all duration-300",
          expandedCard ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="glass-panel grid gap-4 p-4 lg:grid-cols-2">
          <div className="h-64">
            <p className="mb-2 text-sm text-slate-300">MRR timeline</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.points}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#223147" strokeDasharray="4 4" />
                <XAxis dataKey="date" stroke="#8ca0ba" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8ca0ba" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <p className="mb-2 text-sm text-slate-300">Embudo por dia</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.points}>
                <CartesianGrid stroke="#223147" strokeDasharray="4 4" />
                <XAxis dataKey="date" stroke="#8ca0ba" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8ca0ba" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill="#334155" />
                <Bar dataKey="leads" fill="#06b6d4" />
                <Bar dataKey="deals" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64 lg:col-span-2">
            <p className="mb-2 text-sm text-slate-300">Retencion y churn</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.points}>
                <CartesianGrid stroke="#223147" strokeDasharray="4 4" />
                <XAxis dataKey="date" stroke="#8ca0ba" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8ca0ba" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="retention" stroke="#22d3ee" dot={false} />
                <Line type="monotone" dataKey="conversion" stroke="#fbbf24" dot={false} />
                <Line type="monotone" dataKey="churn" stroke="#f43f5e" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {loading ? <p className="text-xs text-slate-400">Actualizando metricas en vivo...</p> : null}
    </section>
  );
}
