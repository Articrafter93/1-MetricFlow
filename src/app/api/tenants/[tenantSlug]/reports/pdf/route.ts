import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appLogger } from "@/lib/logger";
import { createReportDocument } from "@/lib/report-document";
import { getWorkspaceMetrics } from "@/lib/metrics";
import {
  TenantContextError,
  requireTenantApiContext,
} from "@/lib/tenant-context";

export const runtime = "nodejs";

const reportSchema = z
  .object({
    range: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
    from: z.string().optional(),
    to: z.string().optional(),
    clientId: z.string().optional(),
    clientName: z.string().min(2),
    charts: z.array(z.enum(["mrr", "funnel", "retention", "churn"])).min(1),
    logoUrl: z.string().url().optional(),
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

function toPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

type RouteContext = {
  params: Promise<{ tenantSlug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { tenantSlug } = await context.params;

  try {
    const tenantContext = await requireTenantApiContext(tenantSlug, {
      resource: "reports",
      action: "export",
    });

    const parsed = reportSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const metrics = await getWorkspaceMetrics(tenantContext.workspaceId, {
      range: parsed.data.range,
      from: parsed.data.from,
      to: parsed.data.to,
      clientId: parsed.data.clientId,
    });

    const chartToMetric = {
      mrr: { label: "MRR", value: `$${Math.round(metrics.summary.mrr).toLocaleString()}` },
      funnel: {
        label: "Embudo (visitas/leads/deals)",
        value: `${metrics.funnel.visits}/${metrics.funnel.leads}/${metrics.funnel.deals}`,
      },
      retention: {
        label: "Retencion promedio",
        value: toPercent(metrics.summary.retentionRate),
      },
      churn: {
        label: "Churn promedio",
        value: toPercent(metrics.summary.churnRate),
      },
    } as const;

    const selectedMetrics = parsed.data.charts.map((chart) => chartToMetric[chart]);

    const buffer = await renderToBuffer(
      createReportDocument({
        workspaceName: tenantContext.workspaceName,
        logoUrl: parsed.data.logoUrl ?? tenantContext.workspaceLogoUrl,
        dateRangeLabel: metrics.rangeLabel,
        clientName: parsed.data.clientName,
        metrics: selectedMetrics,
      }),
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${tenantSlug}-report-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof TenantContextError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    appLogger.error("reports-pdf-failed", { tenantSlug });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
