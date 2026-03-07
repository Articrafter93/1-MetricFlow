import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWorkspaceMetrics } from "@/lib/metrics";
import { getMockMembershipByUserId } from "@/lib/mock-data";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";

const querySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30),
});

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  let workspaceId: string | undefined;

  if (isMockDatabaseEnabled()) {
    workspaceId =
      session.user.workspaceId ??
      getMockMembershipByUserId(session.user.id)?.workspaceId;
  } else {
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    });

    workspaceId = membership?.workspaceId;
  }

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const metrics = await getWorkspaceMetrics(workspaceId, days);

  return NextResponse.json(metrics);
}
