import { Role } from "@prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReportDocument } from "@/lib/report-document";
import { getWorkspaceMetrics } from "@/lib/metrics";
import { getWorkspaceContext } from "@/lib/workspace";

export const runtime = "nodejs";

const reportSchema = z.object({
  days: z.number().int().min(7).max(365).default(30),
  charts: z
    .array(z.enum(["mrr", "funnel", "retention", "conversion", "churn"]))
    .min(1),
  logoUrl: z.string().url().optional(),
});

function toPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export async function POST(request: NextRequest) {
  const context = await getWorkspaceContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (context.role !== Role.OWNER && context.role !== Role.MANAGER) {
    return NextResponse.json(
      { error: "Only Owner or Manager can export reports." },
      { status: 403 },
    );
  }

  const json = await request.json();
  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const metrics = await getWorkspaceMetrics(context.workspaceId, parsed.data.days);
  const latest = metrics.points[metrics.points.length - 1];
  const earliest = metrics.points[0];

  const chartToMetric = {
    mrr: { label: "MRR actual", value: `$${metrics.summary.mrr.toLocaleString()}` },
    funnel: {
      label: "Embudo (visitas/leads/deals)",
      value: `${latest?.visits ?? 0}/${latest?.leads ?? 0}/${latest?.deals ?? 0}`,
    },
    retention: {
      label: "Retencion promedio",
      value: toPercent(metrics.summary.retention),
    },
    conversion: {
      label: "Conversion promedio",
      value: toPercent(metrics.summary.conversion),
    },
    churn: {
      label: "Churn actual",
      value: toPercent(latest?.churn ?? 0),
    },
  } as const;

  const selectedMetrics = parsed.data.charts.map((chart) => chartToMetric[chart]);

  const buffer = await renderToBuffer(
    createReportDocument({
      workspaceName: context.workspaceName,
      logoUrl: parsed.data.logoUrl ?? context.workspaceLogoUrl,
      dateRangeLabel: `${earliest?.date ?? ""} -> ${latest?.date ?? ""}`,
      metrics: selectedMetrics,
    }),
  );

  const pdfBytes = new Uint8Array(buffer);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="metricflow-report-${Date.now()}.pdf"`,
    },
  });
}
