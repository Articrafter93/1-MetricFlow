import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { appLogger } from "@/lib/logger";
import {
  TenantContextError,
  requireTenantApiContext,
} from "@/lib/tenant-context";

const createClientSchema = z.object({
  name: z.string().min(2).max(120),
  timezone: z.string().min(2).max(60).default("UTC"),
});

type RouteContext = {
  params: Promise<{ tenantSlug: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { tenantSlug } = await context.params;

  try {
    const tenantContext = await requireTenantApiContext(tenantSlug, {
      resource: "clients",
      action: "view",
    });

    const clients = await prisma.clientAccount.findMany({
      where: { workspaceId: tenantContext.workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        timezone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    if (error instanceof TenantContextError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    appLogger.error("clients-list-failed", { tenantSlug });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { tenantSlug } = await context.params;

  try {
    const tenantContext = await requireTenantApiContext(tenantSlug, {
      resource: "clients",
      action: "manage",
    });

    const parsed = createClientSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const client = await prisma.clientAccount.create({
      data: {
        workspaceId: tenantContext.workspaceId,
        name: parsed.data.name,
        timezone: parsed.data.timezone,
      },
      select: {
        id: true,
        name: true,
        timezone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (error instanceof TenantContextError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    appLogger.error("clients-create-failed", { tenantSlug });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
