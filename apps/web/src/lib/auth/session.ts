import { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "./jwt";
import { prisma } from "@aura/database";

export async function getSessionUser(req: NextRequest) {
  // 1. Try Authorization header (Bearer token, set from localStorage)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = token ? await verifyAccessToken(token) : null;
    if (payload) {
      const user = await prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null },
      });
      if (user) return user;
    }
  }

  // 2. Try access-token cookie (set by login/register/OAuth callback)
  const accessTokenCookie = req.cookies.get("access-token")?.value;
  if (accessTokenCookie) {
    const payload = await verifyAccessToken(accessTokenCookie);
    if (payload) {
      const user = await prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null },
      });
      if (user) return user;
    }
  }

  // 3. Fallback: try refresh-token cookie to auto-issue new access token
  const refreshTokenCookie = req.cookies.get("refresh-token")?.value;
  if (refreshTokenCookie) {
    const refreshPayload = await verifyRefreshToken(refreshTokenCookie);
    if (refreshPayload) {
      const session = await prisma.session.findFirst({
        where: {
          refreshToken: refreshTokenCookie,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });
      if (session && !session.user.deletedAt) {
        return session.user;
      }
    }
  }

  return null;
}
