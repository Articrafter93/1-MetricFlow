import { requireTenantPageContext } from "@/lib/tenant-context";

type BillingSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function BillingSettingsPage({
  params,
}: BillingSettingsPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "billingInternal",
    action: "view",
  });

  return (
    <section className="space-y-4">
      <header className="glass-panel p-4">
        <h1 className="text-lg font-semibold text-text-primary">Facturacion interna</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Vista restringida a Owner para control financiero del workspace.
        </p>
      </header>

      <article className="glass-panel p-4">
        <p className="text-sm text-text-secondary">
          Workspace: <span className="text-text-primary">{context.workspaceName}</span>
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-bg-elevated p-3">
            <p className="text-xs uppercase tracking-wide text-text-secondary">MRR objetivo</p>
            <p className="font-kpi mt-2 text-xl text-text-primary">$25,000</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated p-3">
            <p className="text-xs uppercase tracking-wide text-text-secondary">ARR proyectado</p>
            <p className="font-kpi mt-2 text-xl text-text-primary">$300,000</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated p-3">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Estado</p>
            <p className="mt-2 text-sm text-success">Saludable</p>
          </div>
        </div>
      </article>
    </section>
  );
}
