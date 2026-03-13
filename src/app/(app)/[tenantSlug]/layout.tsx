import { DashboardShell } from "@/components/dashboard-shell";
import { ROLE_LABELS } from "@/lib/roles";
import { requireTenantPageContext } from "@/lib/tenant-context";

type TenantLayoutProps = {
  children: React.ReactNode;
  params: Promise<unknown>;
};

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenantSlug } = (await params) as { tenantSlug: string };
  const context = await requireTenantPageContext(tenantSlug);

  return (
    <DashboardShell
      tenantSlug={tenantSlug}
      workspaceName={context.workspaceName}
      roleLabel={ROLE_LABELS[context.role]}
    >
      {children}
    </DashboardShell>
  );
}
