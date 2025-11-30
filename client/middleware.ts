import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const user = token?.user;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/my")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    const isAdminPath =
      pathname.includes("/dashboard/(admin)") || pathname.includes("/admin");
    if (isAdminPath) {
      if (!user?.roles?.includes("ADMIN")) {
        console.log(`Access denied to ${pathname}: User is not an admin.`);
        return NextResponse.redirect(new URL("/403", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/my/dashboard/(admin)/:path*", "/my/:path*"],
};
