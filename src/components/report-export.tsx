"use client";

import { useState } from "react";

type ChartOption = "mrr" | "funnel" | "retention" | "conversion" | "churn";

const options: { id: ChartOption; label: string }[] = [
  { id: "mrr", label: "MRR" },
  { id: "funnel", label: "Embudo de conversion" },
  { id: "retention", label: "Retencion" },
  { id: "conversion", label: "Conversion" },
  { id: "churn", label: "Churn" },
];

export function ReportExport() {
  const [days, setDays] = useState(30);
  const [logoUrl, setLogoUrl] = useState("");
  const [selected, setSelected] = useState<ChartOption[]>([
    "mrr",
    "funnel",
    "retention",
  ]);
  const [status, setStatus] = useState<string | null>(null);

  function toggleChart(id: ChartOption) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function exportPdf(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Generando PDF...");

    const response = await fetch("/api/reports/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days, charts: selected, logoUrl: logoUrl || undefined }),
    });

    if (!response.ok) {
      setStatus("No fue posible exportar el PDF.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `metricflow-report-${Date.now()}.pdf`;
    anchor.click();
    window.URL.revokeObjectURL(url);

    setStatus("PDF descargado.");
  }

  return (
    <section className="space-y-6">
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold">Reportes automatizados</h2>
        <p className="mt-1 text-sm text-slate-400">
          Selecciona graficas clave y exporta un PDF white-label para cada cliente.
        </p>
      </div>

      <form onSubmit={exportPdf} className="glass-panel space-y-4 p-4">
        <label className="block text-sm text-slate-300">
          Rango de dias
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none transition focus:border-cyan-400/70"
          >
            <option value={30}>Ultimos 30 dias</option>
            <option value={60}>Ultimos 60 dias</option>
            <option value={90}>Ultimos 90 dias</option>
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Logo personalizado (URL)
          <input
            type="url"
            placeholder="https://mi-agencia.com/logo.png"
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 outline-none transition focus:border-cyan-400/70"
          />
        </label>

        <div>
          <p className="text-sm text-slate-300">Graficas incluidas</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={() => toggleChart(option.id)}
                  className="h-4 w-4 accent-cyan-400"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={selected.length === 0}
          className="rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900 disabled:text-slate-500"
        >
          Exportar PDF
        </button>

        {status ? <p className="text-sm text-slate-300">{status}</p> : null}
      </form>
    </section>
  );
}
