import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({}).passthrough();

export async function POST(request: Request) {
  const payload = await request
    .json()
    .catch(() => ({} as Record<string, unknown>));
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error:
        "Deprecated endpoint. Use /api/tenants/{tenantSlug}/reports/pdf.",
    },
    { status: 410 },
  );
}
