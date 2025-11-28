import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const user = token?.user;
    const pathname = req.nextUrl.pathname;

    // 🔐 1. Protect /my/* for authenticated users
    if (pathname.startsWith("/my")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // If not admin, redirect to /403 or homepage
    if (!user?.roles?.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // user must be logged in at least
    },
  },
);

// Apply only to admin routes
export const config = {
  matcher: ["/my/dashboard/(admin)/:path*", "/my/:path"],
};
