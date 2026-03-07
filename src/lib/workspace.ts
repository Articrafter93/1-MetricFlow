import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMockMembershipByUserId } from "@/lib/mock-data";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";

export async function getWorkspaceContext() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  if (isMockDatabaseEnabled()) {
    const mockMembership = getMockMembershipByUserId(session.user.id);
    if (!mockMembership) {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email ?? mockMembership.email,
      role: session.user.role ?? mockMembership.role,
      workspaceId: session.user.workspaceId ?? mockMembership.workspaceId,
      workspaceName: session.user.workspaceName ?? mockMembership.workspaceName,
      workspaceSlug: session.user.workspaceSlug ?? mockMembership.workspaceSlug,
      workspaceLogoUrl: mockMembership.workspaceLogoUrl,
    };
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    role: membership.role,
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspace.name,
    workspaceSlug: membership.workspace.slug,
    workspaceLogoUrl: membership.workspace.logoUrl,
  };
}

export async function requireWorkspaceContext() {
  const context = await getWorkspaceContext();
  if (!context) {
    redirect("/sign-in?error=no-workspace");
  }
  return context;
}

export async function requireRole(allowedRoles: Role[]) {
  const context = await requireWorkspaceContext();
  if (!allowedRoles.includes(context.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return context;
}
