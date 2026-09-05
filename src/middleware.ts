import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { SESSION_COOKIE } from "@/lib/constants";

const SECRET =
  process.env.SESSION_SECRET ?? "srudc-local-demo-secret-change-in-production";

type TokenPayload = {
  sub: string;
  role: "member" | "admin";
  exp: number;
};

function readToken(token: string): TokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as TokenPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? readToken(token) : null;

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
