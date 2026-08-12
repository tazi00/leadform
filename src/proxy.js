import { NextResponse } from "next/server";

export function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow the login page and login API to pass through
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminArea) return NextResponse.next();

  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const cookie = req.cookies.get("admin_auth")?.value;

  if (cookie !== adminPassword) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
