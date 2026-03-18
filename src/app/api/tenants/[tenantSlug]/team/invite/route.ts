import crypto from "node:crypto";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_WORKSPACE } from "@/lib/demo-mode";
import { prisma } from "@/lib/db";
import { appLogger } from "@/lib/logger";
import { sendInviteEmail } from "@/lib/mailer";
import {
  TenantContextError,
  requireTenantApiContext,
} from "@/lib/tenant-context";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role).refine((role) => role !== Role.OWNER, {
    message: "Owner role can only be assigned manually.",
  }),
  sendEmail: z.boolean().optional().default(false),
});

type RouteContext = {
  params: Promise<{ tenantSlug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { tenantSlug } = await context.params;

  try {
    const tenantContext = await requireTenantApiContext(tenantSlug, {
      resource: "team",
      action: "invite",
    });

    const parsed = inviteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    if (tenantContext.workspaceId === DEMO_WORKSPACE.id) {
      const demoToken = `demo-${token}`;
      return NextResponse.json({
        inviteUrl: `${baseUrl}/invite/${demoToken}`,
        expiresAt,
        sentEmail: false,
      });
    }

    const inviteUrl = `${baseUrl}/invite/${token}`;

    const invite = await prisma.teamInvite.create({
      data: {
        token,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        workspaceId: tenantContext.workspaceId,
        invitedById: tenantContext.userId,
        expiresAt,
      },
    });

    let sentEmail = false;
    if (parsed.data.sendEmail) {
      const sent = await sendInviteEmail({
        to: invite.email,
        workspaceName: tenantContext.workspaceName,
        role: invite.role,
        inviteUrl,
      });
      sentEmail = sent.sent;
    }

    return NextResponse.json({
      inviteUrl,
      expiresAt: invite.expiresAt,
      sentEmail,
    });
  } catch (error) {
    if (error instanceof TenantContextError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    appLogger.error("team-invite-failed", { tenantSlug });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
