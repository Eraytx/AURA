import { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import { prisma } from "@aura/database";

export async function getSessionUser(req: NextRequest) {
  // 1. Try Authorization header first (Bearer token from localStorage)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) {
      const payload = await verifyAccessToken(token);
      if (payload) {
        const user = await prisma.user.findFirst({
          where: { id: payload.userId, deletedAt: null },
        });
        if (user) return user;
      }
    }
  }

  // 2. Fallback: Try access-token cookie (set by OAuth callback)
  const cookieToken = req.cookies.get("access-token")?.value;
  if (cookieToken) {
    const payload = await verifyAccessToken(cookieToken);
    if (payload) {
      const user = await prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null },
      });
      if (user) return user;
    }
  }

  return null;
}
