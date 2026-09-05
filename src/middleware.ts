import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { readSessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (pathname.startsWith("/banking")) {
    if (!session || session.role !== "member") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session || session.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && session?.role === "member") {
    return NextResponse.redirect(new URL("/banking", request.url));
  }
  if (pathname === "/admin/login" && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/banking/:path*", "/admin/:path*", "/login"],
};
