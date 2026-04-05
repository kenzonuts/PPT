import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-constants";
import { verifyAdminSessionToken } from "@/lib/admin-session-crypto";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? await verifyAdminSessionToken(token) : null;
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
