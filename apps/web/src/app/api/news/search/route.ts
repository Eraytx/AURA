export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { getSessionUser } from "../../../../lib/auth/session";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    const isPremium = user && (user.role === "PREMIUM" || user.role === "ADMIN" || user.plan !== "FREE");

    if (!isPremium) {
      throw new ApiError(403, "FORBIDDEN", "GeliÅŸmiÅŸ arama Ã¶zelliÄŸi sadece Premium Ã¼yelere aÃ§Ä±ktÄ±r.");
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json({ data: [] });
    }

    const events = await prisma.newsEvent.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { titleEn: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        analyses: true,
      },
      take: 20,
    });

    return NextResponse.json({ data: events });
  } catch (err) {
    return handleApiError(err);
  }
}

