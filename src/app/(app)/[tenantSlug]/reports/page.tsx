import { ReportExport } from "@/components/report-export";
import { hasPermission } from "@/lib/rbac";
import { requireTenantPageContext } from "@/lib/tenant-context";

type ReportsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "reports",
    action: "view",
  });

  const canExport = hasPermission(context.role, "reports", "export");

  return canExport ? (
    <ReportExport tenantSlug={tenantSlug} />
  ) : (
    <section className="glass-panel p-4">
      <h1 className="text-lg font-semibold text-text-primary">Reportes</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Tu rol solo permite lectura de metricas y no exportacion PDF.
      </p>
    </section>
  );
}

