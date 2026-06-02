import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const tokenStr = request.cookies.get('auth-token')?.value;

  const publicPaths = ['/login', '/register', '/', '/crm', '/hr'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // If user is not authenticated and trying to access a protected route
  if (!tokenStr && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated
  if (tokenStr) {
    // redirect to home if accessing login/register
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    try {
      const user = JSON.parse(tokenStr);
      
      // Role-based logic
      if (request.nextUrl.pathname.startsWith('/scm') && user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/products', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
