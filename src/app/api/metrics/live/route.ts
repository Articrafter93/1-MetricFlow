import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { getWorkspaceMetrics } from "@/lib/metrics";
import { prisma } from "@/lib/db";

const querySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30),
});

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const parsed = querySchema.safeParse({
    days: request.nextUrl.searchParams.get("days") ?? 30,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const days = parsed.data.days;
  const metrics = await getWorkspaceMetrics(membership.workspaceId, days);

  return NextResponse.json(metrics);
}
