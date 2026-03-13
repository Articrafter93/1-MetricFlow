import { MetricPanels } from "@/components/metric-panels";
import { getWorkspaceMetrics } from "@/lib/metrics";
import { requireTenantPageContext } from "@/lib/tenant-context";

type AnalyticsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "analytics",
    action: "view",
  });

  const metrics = await getWorkspaceMetrics(context.workspaceId, { range: "30d" });

  return (
    <section className="space-y-4">
      <div className="glass-panel p-4">
        <h1 className="text-lg font-semibold text-text-primary">Analytics avanzado</h1>
        <p className="text-sm text-text-secondary">
          Vista extendida con filtros por rango y embudo para el tenant actual.
        </p>
      </div>
      <MetricPanels
        tenantSlug={tenantSlug}
        workspaceName={context.workspaceName}
        initialData={metrics}
      />
    </section>
  );
}
