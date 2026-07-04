export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { validateApiKey } from "../../../../lib/auth/apiKey";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function GET(req: Request) {
  try {
    // 1. Authenticate API Key
    await validateApiKey(req);

    // 2. Parse request query filters
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency") || undefined;
    const impact = searchParams.get("impact") || undefined;
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
    const page = parseInt(searchParams.get("page") || "1", 10);
    const offset = (page - 1) * limit;

    const fromDate = fromStr ? new Date(fromStr) : undefined;
    const toDate = toStr ? new Date(toStr) : undefined;

    const [events, total] = await Promise.all([
      prisma.newsEvent.findMany({
        where: {
          ...(currency && { currency }),
          ...(impact && { impact: impact.toUpperCase() as any }),
          ...((fromDate || toDate) && {
            createdAt: {
              ...(fromDate && { gte: fromDate }),
              ...(toDate && { lte: toDate }),
            },
          }),
        },
        include: {
          analyses: true,
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.newsEvent.count({
        where: {
          ...(currency && { currency }),
          ...(impact && { impact: impact.toUpperCase() as any }),
        },
      }),
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

