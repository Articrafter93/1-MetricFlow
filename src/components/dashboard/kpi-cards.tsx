"use client";

import { useEffect, useMemo, useState } from "react";

type Summary = {
  mrr: number;
  mrrDelta: number;
  activeClients: number;
  retentionRate: number;
  churnRate: number;
};

type KpiCardsProps = {
  summary: Summary;
};

function useAnimatedValue(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startAt) / durationMs);
      setValue(target * progress);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

function KpiCard({
  label,
  value,
  delta,
  suffix = "",
}: {
  label: string;
  value: number;
  delta?: number;
  suffix?: string;
}) {
  const animated = useAnimatedValue(value);
  const integerFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value font-kpi">
        {integerFormatter.format(Math.round(animated))}
        {suffix}
      </p>
      {typeof delta === "number" ? (
        <p className={delta >= 0 ? "metric-delta-success" : "metric-delta-danger"}>
          {delta >= 0 ? "+" : ""}
          {(delta * 100).toFixed(1)}%
        </p>
      ) : null}
    </article>
  );
}

export function KpiCards({ summary }: KpiCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="MRR" value={summary.mrr} delta={summary.mrrDelta} />
      <KpiCard label="Clientes Activos" value={summary.activeClients} />
      <KpiCard
        label="Tasa de Retencion"
        value={summary.retentionRate * 100}
        suffix="%"
      />
      <KpiCard label="Churn Rate" value={summary.churnRate * 100} suffix="%" />
    </section>
  );
}

