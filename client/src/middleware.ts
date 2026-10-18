import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all student portal routes from unauthorized direct URL access
  if (pathname.startsWith("/student")) {
    const token = request.cookies.get("lpu_mess_jwt")?.value;

    if (!token || token === "undefined" || token === "null" || token.trim() === "") {
      // Not authenticated: immediately redirect to login page and ensure cookie is cleared
      const loginUrl = new URL("/", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("lpu_mess_jwt");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*"],
};
