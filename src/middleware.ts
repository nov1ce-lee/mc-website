import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      if (
        path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/_next/static") ||
        path.startsWith("/_next/image") ||
        path === "/favicon.ico"
      ) {
        return true;
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
