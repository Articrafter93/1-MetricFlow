import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appLogger } from "@/lib/logger";
import { MetricsAccessError, getWorkspaceMetrics } from "@/lib/metrics";
import {
  TenantContextError,
  requireTenantApiContext,
} from "@/lib/tenant-context";

const querySchema = z
  .object({
    range: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
    from: z.string().optional(),
    to: z.string().optional(),
    clientId: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.range === "custom" && (!value.from || !value.to)) {
      context.addIssue({
        code: "custom",
        path: ["range"],
        message: "Custom range requires from and to.",
      });
    }
  });

type RouteContext = {
  params: Promise<{ tenantSlug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { tenantSlug } = await context.params;

  try {
    const tenantContext = await requireTenantApiContext(tenantSlug, {
      resource: "analytics",
      action: "view",
    });

    const parsed = querySchema.safeParse({
      range: request.nextUrl.searchParams.get("range") ?? "30d",
      from: request.nextUrl.searchParams.get("from") ?? undefined,
      to: request.nextUrl.searchParams.get("to") ?? undefined,
      clientId: request.nextUrl.searchParams.get("clientId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const metrics = await getWorkspaceMetrics(tenantContext.workspaceId, parsed.data);
    return NextResponse.json(metrics);
  } catch (error) {
    if (error instanceof TenantContextError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof MetricsAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    appLogger.error("metrics-live-failed", { tenantSlug });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
