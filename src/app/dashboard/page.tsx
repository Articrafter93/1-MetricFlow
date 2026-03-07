import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { MetricPanels } from "@/components/metric-panels";
import { getAuthSession } from "@/lib/auth";
import { getWorkspaceMetrics } from "@/lib/metrics";
import { ROLE_LABELS } from "@/lib/roles";
import { prisma } from "@/lib/db";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";
import { requireWorkspaceContext } from "@/lib/workspace";

async function tryAcceptInvite(
  inviteToken: string | undefined,
  userId: string,
  email: string,
) {
  if (isMockDatabaseEnabled()) {
    return;
  }

  if (!inviteToken || !email) {
    return;
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { token: inviteToken },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return;
  }

  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    return;
  }

  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: invite.workspaceId,
        userId,
      },
    },
    update: { role: invite.role },
    create: {
      workspaceId: invite.workspaceId,
      userId,
      role: invite.role,
    },
  });

  await prisma.teamInvite.update({
    where: { token: inviteToken },
    data: { acceptedAt: new Date() },
  });
}

type DashboardPageProps = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  await tryAcceptInvite(params.invite, session.user.id, session.user.email ?? "");

  const context = await requireWorkspaceContext();

  const metrics = await getWorkspaceMetrics(context.workspaceId, 30);
  const roleLabel =
    context.role === Role.OWNER
      ? "Owner"
      : context.role === Role.MANAGER
        ? "Manager"
        : ROLE_LABELS[context.role];

  return (
    <DashboardShell workspaceName={context.workspaceName} roleLabel={roleLabel}>
      <MetricPanels
        workspaceName={context.workspaceName}
        role={context.role}
        initialData={metrics}
      />
    </DashboardShell>
  );
}
