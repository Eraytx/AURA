export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth/session";
import { StripeService } from "../../../../services/stripe/StripeService";
import { handleApiError, ApiError } from "../../../../lib/error";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Ã–ncelikle oturum aÃ§malÄ±sÄ±nÄ±z.");
    }

    if (!user.stripeCustomerId) {
      throw new ApiError(400, "VALIDATION_ERROR", "Fatura geÃ§miÅŸiniz bulunmuyor.");
    }

    const portalUrl = await StripeService.createPortalSession(user.stripeCustomerId);

    return NextResponse.json({ url: portalUrl });
  } catch (err) {
    return handleApiError(err);
  }
}

