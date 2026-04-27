import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/archives",
  "/forum",
  "/profile",
  "/admin",
  "/status",
  "/map",
  "/map-view",
];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const allCookies = request.cookies.getAll();
  const hasSessionToken = allCookies.some(
    (c) =>
      c.name === "next-auth.session-token" ||
      c.name.startsWith("next-auth.session-token.") ||
      c.name === "__Secure-next-auth.session-token" ||
      c.name.startsWith("__Secure-next-auth.session-token.")
  );

  if (!hasSessionToken) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
