export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { getSessionUser } from "../../../../lib/auth/session";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "LÃ¼tfen oturum aÃ§Ä±n.");
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: user.id,
      },
      include: {
        newsEvent: {
          include: {
            analyses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: favorites.map((f) => f.newsEvent) });
  } catch (err) {
    return handleApiError(err);
  }
}

