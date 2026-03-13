import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { appLogger } from "@/lib/logger";
import {
  TenantContextError,
  requireTenantApiContext,
} from "@/lib/tenant-context";

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  logoUrl: z.string().url().nullable(),
});

type RouteContext = {
  params: Promise<{ tenantSlug: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { tenantSlug } = await context.params;

  try {
    const tenantContext = await requireTenantApiContext(tenantSlug, {
      resource: "workspaceSettings",
      action: "manage",
    });

    const parsed = updateWorkspaceSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const workspace = await prisma.workspace.update({
      where: {
        id: tenantContext.workspaceId,
      },
      data: {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    if (error instanceof TenantContextError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    appLogger.error("workspace-settings-update-failed", { tenantSlug });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
