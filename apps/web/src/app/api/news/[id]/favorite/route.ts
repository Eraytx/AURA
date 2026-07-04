import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { getSessionUser } from "../../../../../lib/auth/session";
import { handleApiError, ApiError } from "../../../../../lib/error";

// POST /api/news/[id]/favorite - Add to favorites
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Lütfen oturum açın.");
    }

    // Verify news event exists
    const event = await prisma.newsEvent.findUnique({ where: { id: params.id } });
    if (!event) {
      throw new ApiError(404, "NOT_FOUND", "Haber etkinliği bulunamadı.");
    }

    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_newsEventId: {
          userId: user.id,
          newsEventId: params.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        newsEventId: params.id,
      },
    });

    return NextResponse.json({ data: favorite });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/news/[id]/favorite - Remove from favorites
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Lütfen oturum açın.");
    }

    await prisma.userFavorite.deleteMany({
      where: {
        userId: user.id,
        newsEventId: params.id,
      },
    });

    return NextResponse.json({ message: "Favorilerden çıkarıldı." });
  } catch (err) {
    return handleApiError(err);
  }
}
