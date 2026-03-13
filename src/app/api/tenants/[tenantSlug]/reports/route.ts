import { NextRequest } from "next/server";
import { POST as postPdf } from "./pdf/route";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ tenantSlug: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  return postPdf(request, context);
}
