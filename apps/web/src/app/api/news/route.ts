export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { handleApiError } from "../../../lib/error";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency") || undefined;
    const impact = searchParams.get("impact") || undefined;

    // Build filters — no date restriction so all seed data is always visible
    const where: any = {};
    if (currency) where.currency = currency;
    if (impact) where.impact = impact.toUpperCase();

    const events = await prisma.newsEvent.findMany({
      where,
      include: {
        analyses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to 100 most recent events
    });

    const response = NextResponse.json({ data: events });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
