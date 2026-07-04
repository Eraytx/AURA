import { SignJWT, jwtVerify } from "jose";
import { env } from "../env";

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const JWT_REFRESH_SECRET = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as { userId: string };
  } catch (err) {
    return null;
  }
}
