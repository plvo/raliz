import { type MiddlewareConfig, type NextRequest, NextResponse } from 'next/server';

const NO_AUTH_PATHS = ['/', '/signin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Set the current path in the response headers
  const res = NextResponse.next();
  res.headers.set('x-current-path', pathname);
  return res;
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api/auth (auth API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
} satisfies MiddlewareConfig;
