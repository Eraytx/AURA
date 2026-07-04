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
      throw new ApiError(403, "FORBIDDEN", "GeÃ§miÅŸ haber analizleri sadece Premium Ã¼yelere aÃ§Ä±ktÄ±r.");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.newsEvent.findMany({
        where: {
          eventTime: { not: "" }, // in past
        },
        include: {
          analyses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.newsEvent.count(),
    ]);

    return NextResponse.json({
      data: events,
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

