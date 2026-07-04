import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.newsEvent.findUnique({
      where: { id: params.id },
      include: { analyses: true },
    });

    if (!event) {
      throw new ApiError(404, "NOT_FOUND", "Haber etkinliği bulunamadı.");
    }

    return NextResponse.json({ data: event });
  } catch (err) {
    return handleApiError(err);
  }
}
