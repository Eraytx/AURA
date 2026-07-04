export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth/session";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../lib/error";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "LÃ¼tfen oturum aÃ§Ä±n.");
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: invoices });
  } catch (err) {
    return handleApiError(err);
  }
}

