export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth/session";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "LÃ¼tfen giriÅŸ yapÄ±n.");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        plan: true,
        role: true,
        planExpiresAt: true,
      },
    });

    return NextResponse.json({ data: dbUser });
  } catch (err) {
    return handleApiError(err);
  }
}

