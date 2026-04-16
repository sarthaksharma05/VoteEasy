import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export interface AuthTokenPayload {
  userId: string;
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

export function isTokenError(error: unknown) {
  return error instanceof JsonWebTokenError || error instanceof TokenExpiredError;
}
