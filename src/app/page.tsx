import Link from "next/link";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MetricFlow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Plataforma SaaS B2B multi-tenant para analitica de agencias y franquicias.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#1d2f49,_#070b14_45%)] px-4">
      <main className="glass-panel w-full max-w-4xl p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">MetricFlow SaaS</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Analitica multi-tenant para agencias y franquicias.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
          Dashboard B2B en tiempo real con aislamiento por workspace, roles Owner/Manager/Client,
          reportes PDF white-label y backend listo para Docker + PostgreSQL.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Ver dashboard
          </Link>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
    </div>
  );
}
