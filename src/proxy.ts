import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const tenantPageMatch = pathname.match(
    /^\/([^/]+)\/(dashboard|analytics|clients|reports|settings)(\/|$)/,
  );
  const tenantApiMatch = pathname.match(/^\/api\/tenants\/([^/]+)\//);

  const sessionCookiePresent =
    request.cookies.has("__Secure-next-auth.session-token") ||
    request.cookies.has("next-auth.session-token");

  if (!sessionCookiePresent && (tenantPageMatch || tenantApiMatch)) {
    if (tenantApiMatch) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const tenantSlug = tenantApiMatch?.[1] ?? tenantPageMatch?.[1];
  if (!tenantSlug) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.set("x-tenant-slug", tenantSlug);

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: [
    "/:tenantSlug/dashboard/:path*",
    "/:tenantSlug/analytics/:path*",
    "/:tenantSlug/clients/:path*",
    "/:tenantSlug/reports/:path*",
    "/:tenantSlug/settings/:path*",
    "/api/tenants/:tenantSlug/:path*",
    "/sign-in",
  ],
};
