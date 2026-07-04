import { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import { prisma } from "@aura/database";

export async function getSessionUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  // Retrieve user and check soft delete status
  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      deletedAt: null,
    },
  });

  return user;
}
