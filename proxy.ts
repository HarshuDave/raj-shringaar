import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "rs_admin_auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all /admin routes
  if (pathname.startsWith("/admin")) {
    const authCookie = request.cookies.get(AUTH_COOKIE);
    const isAuthenticated = authCookie?.value === "authenticated";

    // Public admin route: login page
    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // All other /admin routes require active authentication
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
