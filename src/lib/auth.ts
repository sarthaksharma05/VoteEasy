import { jwtVerify, SignJWT } from 'jose'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

export interface AuthTokenPayload {
  userId: string;
  email?: string;
}

export async function generateToken(userId: string, email?: string) {
  return await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as unknown as AuthTokenPayload;
}

export function isTokenError(error: unknown) {
  return error instanceof Error && error.name.includes('JWT');
}
