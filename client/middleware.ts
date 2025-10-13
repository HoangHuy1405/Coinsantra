import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const user = req.nextauth.token?.user;

    console.log(user);

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
  matcher: ["/admin/:path*"],
};
