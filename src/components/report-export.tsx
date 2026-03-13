"use client";

import { useState } from "react";

type ChartOption = "mrr" | "funnel" | "retention" | "churn";

const options: { id: ChartOption; label: string }[] = [
  { id: "mrr", label: "MRR" },
  { id: "funnel", label: "Embudo de conversion" },
  { id: "retention", label: "Retencion" },
  { id: "churn", label: "Churn" },
];

type ReportExportProps = {
  tenantSlug: string;
};

export function ReportExport({ tenantSlug }: ReportExportProps) {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
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

    const response = await fetch(`/api/tenants/${tenantSlug}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        range,
        from: range === "custom" ? from : undefined,
        to: range === "custom" ? to : undefined,
        clientId: clientId.trim() || undefined,
        clientName,
        charts: selected,
        logoUrl: logoUrl || undefined,
      }),
    });

    if (!response.ok) {
      setStatus("No fue posible exportar el PDF.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tenantSlug}-report-${Date.now()}.pdf`;
    anchor.click();
    window.URL.revokeObjectURL(url);

    setStatus("PDF descargado.");
  }

  return (
    <section className="space-y-6">
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold">Reportes automatizados</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Selecciona graficas clave y exporta un PDF white-label para cada cliente.
        </p>
      </div>

      <form onSubmit={exportPdf} className="glass-panel space-y-4 p-4">
        <label className="block text-sm text-text-primary">
          Rango
          <select
            value={range}
            onChange={(event) =>
              setRange(event.target.value as "7d" | "30d" | "90d" | "custom")
            }
            className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
          >
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        {range === "custom" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm text-text-primary">
              Desde
              <input
                type="date"
                required
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
              />
            </label>
            <label className="block text-sm text-text-primary">
              Hasta
              <input
                type="date"
                required
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
              />
            </label>
          </div>
        ) : null}

        <label className="block text-sm text-text-primary">
          Nombre del cliente
          <input
            type="text"
            required
            placeholder="Cliente principal"
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>
        <label className="block text-sm text-text-primary">
          Client ID (opcional)
          <input
            type="text"
            placeholder="clt_123"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <label className="block text-sm text-text-primary">
          Logo personalizado (URL)
          <input
            type="url"
            placeholder="https://mi-agencia.com/logo.png"
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 outline-none transition focus:border-accent"
          />
        </label>

        <div>
          <p className="text-sm text-text-primary">Graficas incluidas</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={() => toggleChart(option.id)}
                  className="h-4 w-4 accent-accent"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={selected.length === 0}
          className="rounded-lg border border-accent bg-accent/15 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-bg-elevated disabled:text-text-secondary"
        >
          Exportar PDF
        </button>

        {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
      </form>
    </section>
  );
}
