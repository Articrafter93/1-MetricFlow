import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { DEMO_WORKSPACE, getDemoTenantContext, isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/db";
import { type RbacAction, type RbacResource, hasPermission } from "@/lib/rbac";

export type TenantRequestContext = {
  userId: string;
  email: string;
  role: Role;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  workspaceLogoUrl: string | null;
};

export class TenantContextError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "TenantContextError";
    this.status = status;
  }
}

export async function resolveTenantContext(tenantSlug: string): Promise<TenantRequestContext> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new TenantContextError(401, "Unauthorized");
  }

  if (
    session.user.workspaceSlug === tenantSlug &&
    session.user.workspaceId &&
    session.user.role
  ) {
    return {
      userId: session.user.id,
      email: session.user.email ?? "",
      role: session.user.role,
      workspaceId: session.user.workspaceId,
      workspaceSlug: session.user.workspaceSlug,
      workspaceName: session.user.workspaceName ?? DEMO_WORKSPACE.name,
      workspaceLogoUrl: session.user.workspaceLogoUrl ?? null,
    };
  }

  if (isDemoMode() && tenantSlug === DEMO_WORKSPACE.slug) {
    return getDemoTenantContext(
      session.user.id,
      session.user.email ?? "",
      session.user.role ?? Role.OWNER,
    );
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      workspace: {
        slug: tenantSlug,
      },
    },
    include: { workspace: true },
  });

  if (!membership) {
    throw new TenantContextError(403, "Forbidden");
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    role: membership.role,
    workspaceId: membership.workspaceId,
    workspaceSlug: membership.workspace.slug,
    workspaceName: membership.workspace.name,
    workspaceLogoUrl: membership.workspace.logoUrl,
  };
}

export async function requireTenantPageContext(
  tenantSlug: string,
  permission?: { resource: RbacResource; action: RbacAction },
) {
  try {
    const context = await resolveTenantContext(tenantSlug);
    if (
      permission &&
      !hasPermission(context.role, permission.resource, permission.action)
    ) {
      redirect(`/${tenantSlug}/dashboard?error=forbidden`);
    }
    return context;
  } catch (error) {
    if (error instanceof TenantContextError) {
      if (error.status === 401) {
        redirect(`/login?callbackUrl=/${tenantSlug}/dashboard`);
      }
      redirect("/login?error=forbidden");
    }
    throw error;
  }
}

export async function requireTenantApiContext(
  tenantSlug: string,
  permission?: { resource: RbacResource; action: RbacAction },
) {
  const context = await resolveTenantContext(tenantSlug);
  if (
    permission &&
    !hasPermission(context.role, permission.resource, permission.action)
  ) {
    throw new TenantContextError(403, "Forbidden");
  }
  return context;
}

export async function getTenantSlugFromRequestHeaders() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-tenant-slug");
}
