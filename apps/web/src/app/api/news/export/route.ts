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
      throw new ApiError(403, "FORBIDDEN", "DÄ±ÅŸa aktarÄ±m Ã¶zelliÄŸi sadece Premium Ã¼yelere aÃ§Ä±ktÄ±r.");
    }

    const events = await prisma.newsEvent.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Build CSV Content
    let csv = "ID,Title,TitleEn,Currency,Impact,Forecast,Actual,Previous,EventTime,Source,CreatedAt\n";
    events.forEach((e: any) => {
      const cleanTitle = e.title.replace(/"/g, '""');
      const cleanTitleEn = e.titleEn.replace(/"/g, '""');
      csv += `"${e.id}","${cleanTitle}","${cleanTitleEn}","${e.currency}","${e.impact}","${e.forecast || ""}","${e.actual || ""}","${e.previous || ""}","${e.eventTime}","${e.source || ""}","${e.createdAt.toISOString()}"\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=aura_news_events.csv",
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

