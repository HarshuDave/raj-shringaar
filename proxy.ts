import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie = request.cookies.get("rs_admin_auth");

    if (authCookie?.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
