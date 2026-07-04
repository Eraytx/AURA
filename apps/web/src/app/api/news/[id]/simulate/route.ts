import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@aura/database";
import { getSessionUser } from "../../../../../lib/auth/session";
import { handleApiError, ApiError } from "../../../../../lib/error";

const simulateSchema = z.object({
  simulatedValue: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req as any);
    const isPremium = user && (user.role === "PREMIUM" || user.role === "ADMIN" || user.plan !== "FREE");

    if (!isPremium) {
      throw new ApiError(403, "FORBIDDEN", "Simülasyon hesaplama özelliği sadece Premium üyelere açıktır.");
    }

    const body = await req.json();
    const parsed = simulateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Geçersiz değer girdiniz.", parsed.error.flatten());
    }

    const event = await prisma.newsEvent.findUnique({
      where: { id: params.id },
      include: { analyses: true }
    });

    if (!event) {
      throw new ApiError(404, "NOT_FOUND", "Haber etkinliği bulunamadı.");
    }

    const forecastVal = event.forecast || "0.2";
    const simVal = parsed.data.simulatedValue;

    // Clean numerical values
    const numForecast = parseFloat(forecastVal.replace(/[^\d.-]/g, "")) || 0;
    const numSimulated = parseFloat(simVal.replace(/[^\d.-]/g, "")) || 0;
    const deviation = numSimulated - numForecast;

    const isInflation = event.category?.toLowerCase().includes("inflation") || event.title.toLowerCase().includes("cpi") || event.title.toLowerCase().includes("pce");
    
    // Higher inflation is bad for Gold (rates go up, yieldless gold falls)
    // Higher jobs/GDP is bad for Gold (DXY strengthens)
    const surpriseFactor = isInflation ? -1 : -1; 
    const isGoldPositive = deviation * surpriseFactor > 0;
    const direction = deviation === 0 ? "neutral" : (isGoldPositive ? "up" : "down");
    
    // Pip movement scale: 1% deviation = 100 pips ($10.00 move)
    const pipMovement = Math.round(Math.abs(deviation) * 100 * (event.impact === "HIGH" ? 1.5 : 0.8));

    const description = direction === "up" 
      ? `Açıklanan değer beklentinin altında kalarak USD üzerindeki baskıyı artırdı. Altın fiyatında yaklaşık $${(pipMovement / 10).toFixed(2)} (${pipMovement} pip) yükseliş bekleniyor.`
      : direction === "down"
        ? `Açıklanan güçlü veri USD'yi destekledi. Altın fiyatında yaklaşık $${(pipMovement / 10).toFixed(2)} (${pipMovement} pip) düşüş yönlü satış baskısı bekleniyor.`
        : "Açıklanan veri beklentilere paralel geldi. Fiyatta yatay seyir ve zikzak hareketler beklenmektedir.";

    return NextResponse.json({
      data: {
        direction,
        pipMovement,
        deviation,
        description,
        timestamp: new Date(),
      }
    });
  } catch (err) {
    return handleApiError(err);
  }
}
