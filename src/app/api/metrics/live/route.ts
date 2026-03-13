import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "custom"]).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    range: url.searchParams.get("range") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error:
        "Deprecated endpoint. Use /api/tenants/{tenantSlug}/metrics/live.",
    },
    { status: 410 },
  );
}
