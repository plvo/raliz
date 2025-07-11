import { type MiddlewareConfig, type NextRequest, NextResponse } from 'next/server';

const NO_AUTH_PATHS = ['/', '/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`[MIDDLEWARE] pathname "${pathname}"`);

  // // Redirect to the sign-in page if the user is not authenticated and tries to access a protected route
  // if (!NO_AUTH_PATHS.includes(pathname)) {
  //   const res = NextResponse.redirect(new URL('/login', req.url));
  //   res.headers.set('x-current-path', '/');
  //   return res;
  // }

  // // Redirect to the publications page if the user is authenticated and tries to access the sign-in page
  // if (pathname.startsWith('/login')) {
  //   const res = NextResponse.redirect(new URL('/', req.url));
  //   res.headers.set('x-current-path', '/');
  //   return res;
  // }

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
