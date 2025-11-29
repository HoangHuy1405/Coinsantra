import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const user = token?.user;
    const pathname = req.nextUrl.pathname;

    const isAuthRoute = ["/login", "/register", "/verify"].some((route) =>
      pathname.startsWith(route)
    );

    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }


    if (pathname.startsWith("/my/dashboard")) {
      if (!user?.roles?.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/403", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/verify")
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/my/:path*",
    "/login",
    "/register",
    "/verify"
  ],
};