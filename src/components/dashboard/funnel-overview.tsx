type FunnelSummary = {
  visits: number;
  leads: number;
  deals: number;
  visitToLeadPct: number;
  leadToDealPct: number;
};

type FunnelOverviewProps = {
  funnel: FunnelSummary;
};

function Stage({
  label,
  value,
  percent,
}: {
  label: string;
  value: number;
  percent: number;
}) {
  return (
    <article className="rounded-lg border border-border bg-bg-elevated p-3">
      <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
      <p className="font-kpi mt-2 text-xl text-text-primary">{value.toLocaleString()}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-surface">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${Math.max(4, Math.round(percent * 100))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-text-secondary">{(percent * 100).toFixed(1)}%</p>
    </article>
  );
}

export function FunnelOverview({ funnel }: FunnelOverviewProps) {
  return (
    <section className="glass-panel space-y-3 p-4">
      <header>
        <h2 className="text-base font-semibold text-text-primary">Funnel de conversion</h2>
        <p className="text-sm text-text-secondary">
          Porcentajes entre etapas del embudo actual.
        </p>
      </header>
      <div className="grid gap-3 lg:grid-cols-3">
        <Stage label="Visitas" value={funnel.visits} percent={1} />
        <Stage
          label="Leads"
          value={funnel.leads}
          percent={funnel.visitToLeadPct}
        />
        <Stage
          label="Deals"
          value={funnel.deals}
          percent={funnel.visitToLeadPct * funnel.leadToDealPct}
        />
      </div>
      <p className="text-xs text-text-secondary">
        Visitas→Leads: {(funnel.visitToLeadPct * 100).toFixed(1)}% | Leads→Deals:{" "}
        {(funnel.leadToDealPct * 100).toFixed(1)}%
      </p>
    </section>
  );
}

