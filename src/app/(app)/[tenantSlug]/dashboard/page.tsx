import { MetricPanelsClientShell } from "@/components/metric-panels-client-shell";
import { getWorkspaceMetrics } from "@/lib/metrics";
import { requireTenantPageContext } from "@/lib/tenant-context";

type DashboardPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "dashboard",
    action: "view",
  });

  const metrics = await getWorkspaceMetrics(context.workspaceId, { range: "30d" });

  return (
    <MetricPanelsClientShell
      tenantSlug={tenantSlug}
      workspaceName={context.workspaceName}
      initialData={metrics}
    />
  );
}
