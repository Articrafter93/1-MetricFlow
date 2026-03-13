"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricPoint, MetricsRange } from "@/lib/metrics";

type RevenueChartProps = {
  points: MetricPoint[];
  range: MetricsRange;
  customFrom: string;
  customTo: string;
  onRangeChange: (value: MetricsRange) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
};

export function RevenueChart({
  points,
  range,
  customFrom,
  customTo,
  onRangeChange,
  onCustomFromChange,
  onCustomToChange,
}: RevenueChartProps) {
  return (
    <section className="glass-panel space-y-3 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Revenue Line Chart</h2>
          <p className="text-sm text-text-secondary">MRR en tiempo casi real por rango.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["7d", "30d", "90d", "custom"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onRangeChange(option)}
              className={
                range === option
                  ? "rounded-md border border-accent bg-accent/15 px-3 py-1 text-xs text-text-primary"
                  : "rounded-md border border-border bg-bg-elevated px-3 py-1 text-xs text-text-secondary"
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {range === "custom" ? (
        <div className="grid gap-2 md:grid-cols-2">
          <label className="text-xs text-text-secondary">
            From
            <input
              type="date"
              value={customFrom}
              onChange={(event) => onCustomFromChange(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg-elevated px-2 py-1 text-text-primary"
            />
          </label>
          <label className="text-xs text-text-secondary">
            To
            <input
              type="date"
              value={customTo}
              onChange={(event) => onCustomToChange(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg-elevated px-2 py-1 text-text-primary"
            />
          </label>
        </div>
      ) : null}

      {points.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No hay puntos de ingresos para el rango seleccionado.
        </p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <CartesianGrid stroke="#2A2A3A" strokeDasharray="4 4" />
              <XAxis dataKey="date" stroke="#8888AA" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8888AA" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A24",
                  border: "1px solid #2A2A3A",
                  borderRadius: "10px",
                  color: "#F0F0FF",
                }}
              />
              <Line type="monotone" dataKey="mrr" stroke="#7C6FCD" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
