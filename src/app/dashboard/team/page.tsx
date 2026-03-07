import { DashboardShell } from "@/components/dashboard-shell";
import { TeamSettings } from "@/components/team-settings";
import { ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/db";
import { getMockTeamMembers } from "@/lib/mock-data";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function TeamPage() {
  const context = await requireWorkspaceContext();

  const members = isMockDatabaseEnabled()
    ? getMockTeamMembers()
    : (
        await prisma.membership.findMany({
          where: { workspaceId: context.workspaceId },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        })
      ).map((membership) => ({
        id: membership.id,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
      }));

  return (
    <DashboardShell
      workspaceName={context.workspaceName}
      roleLabel={ROLE_LABELS[context.role]}
    >
      <TeamSettings currentRole={context.role} members={members} />
    </DashboardShell>
  );
}
