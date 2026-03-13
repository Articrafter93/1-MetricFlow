import type { CohortRow } from "@/lib/metrics";

type CohortHeatmapProps = {
  cohorts: CohortRow[];
};

function cellStyle(value: number) {
  const alpha = Math.max(0.05, Math.min(1, value));
  return {
    backgroundColor: `rgba(124, 111, 205, ${alpha})`,
  };
}

export function CohortHeatmap({ cohorts }: CohortHeatmapProps) {
  return (
    <section className="glass-panel overflow-x-auto p-4">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-text-primary">Retention Cohort Heatmap</h2>
        <p className="text-sm text-text-secondary">Cohortes por mes con degradado de retencion.</p>
      </header>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-border bg-bg-surface px-2 py-1 text-left text-text-secondary">
              Cohort
            </th>
            {Array.from({ length: 8 }).map((_, index) => (
              <th
                key={`m-${index}`}
                className="border border-border bg-bg-surface px-2 py-1 text-text-secondary"
              >
                M{index}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.cohort}>
              <td className="border border-border bg-bg-surface px-2 py-1 text-text-primary">
                {row.cohort}
              </td>
              {row.values.map((value, index) => (
                <td
                  key={`${row.cohort}-${index}`}
                  className="border border-border px-2 py-1 text-center text-text-primary"
                  style={cellStyle(value)}
                >
                  {(value * 100).toFixed(0)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

