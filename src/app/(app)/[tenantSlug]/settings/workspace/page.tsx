import { WorkspaceSettingsForm } from "@/components/workspace-settings-form";
import { requireTenantPageContext } from "@/lib/tenant-context";

type WorkspaceSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "workspaceSettings",
    action: "manage",
  });

  return (
    <WorkspaceSettingsForm
      tenantSlug={tenantSlug}
      initialName={context.workspaceName}
      initialLogoUrl={context.workspaceLogoUrl}
    />
  );
}

