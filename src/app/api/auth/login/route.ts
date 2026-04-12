import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password || !validateCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const token = await signToken(username);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return response;
}
