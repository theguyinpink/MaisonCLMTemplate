import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  // laisse /admin accessible (page de login possible)
  if (pathname === "/admin") return NextResponse.next();

  // protège les routes /api/admin/*
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/api/admin/:path*"],
};
