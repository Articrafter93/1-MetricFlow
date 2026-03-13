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
    <div className="auth-bg flex min-h-screen items-center justify-center px-4">
      <main className="glass-panel w-full max-w-4xl p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">MetricFlow SaaS</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Analitica multi-tenant para agencias y franquicias.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-text-secondary md:text-base">
          Dashboard B2B en tiempo real con aislamiento por workspace, roles Owner/Manager/Client,
          reportes PDF white-label y backend listo para Docker + PostgreSQL.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-accent bg-accent/20 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-accent/30"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/app-redirect"
            className="rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent"
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
