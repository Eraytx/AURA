import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../../lib/auth/session";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../../../lib/error";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Öncelikle oturum açmalısınız.");
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice || invoice.userId !== user.id) {
      throw new ApiError(404, "NOT_FOUND", "Fatura bulunamadı.");
    }

    if (!invoice.invoicePdf) {
      throw new ApiError(400, "VALIDATION_ERROR", "Fatura PDF bağlantısı bulunmuyor.");
    }

    // Redirect to the Stripe PDF URL
    return NextResponse.redirect(invoice.invoicePdf);
  } catch (err) {
    return handleApiError(err);
  }
}
