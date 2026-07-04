import { NextResponse } from "next/server";
import { StripeService } from "../../../../services/stripe/StripeService";
import { handleApiError } from "../../../../lib/error";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature") || "";
    
    // Extract raw body array buffer
    const arrayBuffer = await req.arrayBuffer();
    const rawBody = Buffer.from(arrayBuffer);

    await StripeService.handleWebhook(rawBody, signature);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe Webhook Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
