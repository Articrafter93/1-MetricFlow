import { handlers } from "@/lib/auth";
import { appLogger } from "@/lib/logger";
import { NextRequest } from "next/server";

const authGet = handlers.GET;
const authPost = handlers.POST;

export async function GET(request: NextRequest) {
  try {
    return await authGet(request);
  } catch (error) {
    const requestUrl = new URL(request.url);
    const isSessionEndpoint = requestUrl.pathname.endsWith("/api/auth/session");

    if (process.env.NODE_ENV !== "production" && isSessionEndpoint) {
      appLogger.warn("auth-session-fallback", {
        reason: error instanceof Error ? error.message : "unknown",
      });
      return Response.json(null, { status: 200 });
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  return authPost(request);
}
