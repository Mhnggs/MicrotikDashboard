import { SignJWT, jwtVerify } from 'jose';

const SECRET    = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'fallback-dev-secret');
const USERNAME  = process.env.ADMIN_USERNAME ?? 'admin';
const PASSWORD  = process.env.ADMIN_PASSWORD ?? 'admin';
const TOKEN_TTL = '12h';

export const COOKIE_NAME = 'cafe-auth';

export function validateCredentials(username: string, password: string): boolean {
  return username === USERNAME && password === PASSWORD;
}

export async function signToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { username: payload.username as string };
  } catch {
    return null;
  }
}
