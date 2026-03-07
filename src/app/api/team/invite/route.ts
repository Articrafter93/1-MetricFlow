import crypto from "node:crypto";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendInviteEmail } from "@/lib/mailer";
import { prisma } from "@/lib/db";
import { isMockDatabaseEnabled } from "@/lib/runtime-mode";
import { getWorkspaceContext } from "@/lib/workspace";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
  sendEmail: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const context = await getWorkspaceContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (context.role !== Role.OWNER) {
    return NextResponse.json(
      { error: "Only Owner can invite members." },
      { status: 403 },
    );
  }

  const json = await request.json();
  const parsed = inviteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/sign-in?invite=${token}`;

  if (isMockDatabaseEnabled()) {
    let sentEmail = false;
    if (parsed.data.sendEmail) {
      const sent = await sendInviteEmail({
        to: parsed.data.email.toLowerCase(),
        workspaceName: context.workspaceName,
        role: parsed.data.role,
        inviteUrl,
      });
      sentEmail = sent.sent;
    }

    return NextResponse.json({
      inviteUrl,
      expiresAt,
      sentEmail,
      mode: "mock",
    });
  }

  const invite = await prisma.teamInvite.create({
    data: {
      token,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      workspaceId: context.workspaceId,
      invitedById: context.userId,
      expiresAt,
    },
  });

  let sentEmail = false;
  if (parsed.data.sendEmail) {
    const sent = await sendInviteEmail({
      to: invite.email,
      workspaceName: context.workspaceName,
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
}
