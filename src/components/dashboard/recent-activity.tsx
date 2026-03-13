import type { ActivityEntry } from "@/lib/metrics";

type RecentActivityProps = {
  events: ActivityEntry[];
};

export function RecentActivity({ events }: RecentActivityProps) {
  return (
    <section className="glass-panel p-4">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
        <p className="text-sm text-text-secondary">Eventos recientes del workspace.</p>
      </header>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No hay actividad reciente para este rango.
          </p>
        ) : null}
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-md border border-border bg-bg-elevated px-3 py-2"
          >
            <p className="text-sm text-text-primary">{event.message}</p>
            <p className="text-xs text-text-secondary">{event.timestamp}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
