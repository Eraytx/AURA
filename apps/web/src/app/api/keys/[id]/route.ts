import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth/session";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Lütfen giriş yapın.");
    }

    await prisma.apiKey.updateMany({
      where: { id: params.id, userId: user.id },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ message: "API Anahtarı iptal edildi." });
  } catch (err) {
    return handleApiError(err);
  }
}
