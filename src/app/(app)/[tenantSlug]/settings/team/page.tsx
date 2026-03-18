import { prisma } from "@/lib/db";
import { DEMO_WORKSPACE, getDemoMembers } from "@/lib/demo-mode";
import { TeamSettings } from "@/components/team-settings";
import { requireTenantPageContext } from "@/lib/tenant-context";

type TeamSettingsPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantPageContext(tenantSlug, {
    resource: "team",
    action: "view",
  });

  const members =
    context.workspaceId === DEMO_WORKSPACE.id
      ? getDemoMembers()
      : await prisma.membership.findMany({
          where: { workspaceId: context.workspaceId },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        });

  return (
    <TeamSettings
      tenantSlug={tenantSlug}
      currentRole={context.role}
      members={members.map((member) => ({
        id: member.id,
        name: "user" in member ? member.user.name : member.name,
        email: "user" in member ? member.user.email : member.email,
        role: member.role,
      }))}
    />
  );
}
