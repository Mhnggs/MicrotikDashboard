import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { COOKIE_NAME } from '@/lib/auth';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'fallback-dev-secret');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public: login page and auth API endpoints pass through
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/computers/:path*',
    '/api/isp/:path*',
    '/api/office-isp/:path*',
  ],
};
