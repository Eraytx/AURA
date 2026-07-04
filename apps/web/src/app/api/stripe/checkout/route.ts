export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "../../../../lib/auth/session";
import { StripeService } from "../../../../services/stripe/StripeService";
import { handleApiError, ApiError } from "../../../../lib/error";

const checkoutSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "LÃ¼tfen iÅŸlem yapabilmek iÃ§in giriÅŸ yapÄ±n.");
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "GeÃ§ersiz plan seÃ§imi.", parsed.error.flatten());
    }

    const checkoutUrl = await StripeService.createCheckoutSession(user.id, parsed.data.plan);

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    return handleApiError(err);
  }
}

