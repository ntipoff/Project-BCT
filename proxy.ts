import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/session";

export const SESSION_COOKIE = "bct_session";

export const config = {
  matcher: ["/((?!login|api/login|_next|favicon.ico).*)"],
};

// Separated from `proxy` so tests can call it directly with an explicit secret,
// without colliding with the NextFetchEvent Next.js passes as a real second argument.
export async function checkSession(request: NextRequest, secret: string | undefined) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = secret ? await verifySessionToken(token, secret) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  return checkSession(request, process.env.SESSION_SECRET);
}
