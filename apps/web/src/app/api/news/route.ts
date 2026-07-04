export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../lib/error";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency") || undefined;
    const impact = searchParams.get("impact") || undefined;

    // Fetch this week's events
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await prisma.newsEvent.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo,
          lte: oneWeekLater,
        },
        ...(currency && { currency }),
        ...(impact && { impact: impact.toUpperCase() as any }),
      },
      include: {
        analyses: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const response = NextResponse.json({ data: events });
    
    // Cache for 5 minutes (s-maxage: 300 seconds)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

