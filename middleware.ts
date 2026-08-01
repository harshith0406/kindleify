import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get('auth_session');

  // Protect /dashboard and /reader routes
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/reader')) {
    if (!authSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If already logged in, prevent accessing the login page
  if (request.nextUrl.pathname === '/login' && authSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/reader/:path*', '/login'],
};
