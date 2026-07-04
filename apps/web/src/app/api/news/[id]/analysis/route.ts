import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { getSessionUser } from "../../../../../lib/auth/session";
import { AnalysisEngine } from "../../../../../services/analysis/AnalysisEngine";
import { handleApiError, ApiError } from "../../../../../lib/error";

const engine = new AnalysisEngine();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req as any);
    const isPremium = user && (user.role === "PREMIUM" || user.role === "ADMIN" || user.plan !== "FREE");

    // Retrieve or trigger analysis
    const analysis = await engine.analyzeNewsEvent(params.id);

    if (isPremium) {
      // Premium user receives full payload
      return NextResponse.json({ data: analysis });
    } else {
      // Free user receives restricted/obfuscated summary
      const summaryPayload = {
        expectation: analysis.expectation,
        expectationEn: analysis.expectationEn,
        sentiment: analysis.sentiment,
        sentimentLabel: analysis.sentimentLabel,
        aiImpactScore: analysis.aiImpactScore,
        // Block other details for upsell CTA
        isPremiumLocked: true,
      };
      return NextResponse.json({ data: summaryPayload });
    }
  } catch (err) {
    return handleApiError(err);
  }
}
