export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";

export async function GET(req: Request) {
  try {
    const events = await prisma.newsEvent.findMany({
      include: {
        analyses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    return NextResponse.json({ error: "VeritabanÄ± baÄŸlantÄ± hatasÄ±." }, { status: 500 });
  }
}

