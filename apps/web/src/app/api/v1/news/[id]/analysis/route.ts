import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { validateApiKey } from "../../../../../../lib/auth/apiKey";
import { handleApiError, ApiError } from "../../../../../../lib/error";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate API Key
    await validateApiKey(req);

    // 2. Fetch analysis record
    const analysis = await prisma.newsAnalysis.findUnique({
      where: { newsEventId: params.id },
    });

    if (!analysis) {
      throw new ApiError(404, "NOT_FOUND", "Bu haber için henüz yapay zeka analizi bulunmuyor.");
    }

    return NextResponse.json({
      data: {
        expectation: analysis.expectation,
        sentiment: analysis.sentiment,
        sentimentLabel: analysis.sentimentLabel,
        aiImpactScore: analysis.aiImpactScore,
        volatilityScore: analysis.volatilityScore,
        confidenceScore: analysis.confidenceScore,
        deviationAnalysis: analysis.deviationAnalysis ? JSON.parse(analysis.deviationAnalysis) : null,
        historical: analysis.historicalJson ? JSON.parse(analysis.historicalJson as string) : [],
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
