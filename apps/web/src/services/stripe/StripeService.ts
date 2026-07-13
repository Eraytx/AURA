import Stripe from "stripe";
import { prisma } from "@aura/database";
import { env } from "../../lib/env";
import { EmailService } from "../email/EmailService";

export const PLANS = {
  MONTHLY: {
    priceId: env.STRIPE_MONTHLY_PRICE_ID,
    amount: 999, // $9.99
    currency: "usd",
    interval: "month",
    features: [
      "90 günlük geçmiş haberler",
      "AI haber simülatörü",
      "Grafik detayları",
      "CSV dışa aktarma",
      "Email bildirimleri",
      "API erişimi",
      "Reklamsız deneyim",
    ],
  },
  YEARLY: {
    priceId: env.STRIPE_YEARLY_PRICE_ID,
    amount: 7999, // $79.99
    currency: "usd",
    interval: "year",
    features: [
      "MONTHLY özellikleri",
      "Öncelikli destek",
      "Daha düşük maliyet (%33 indirim)",
    ],
  },
};

export class StripeService {
  private static stripe: Stripe | null = null;

  private static getClient() {
    if (!this.stripe && env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== "sk_test_mock") {
      this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16" as any,
      });
    }
    return this.stripe;
  }

  public static async createCustomer(userId: string, email: string, name: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      console.log(`[MOCK STRIPE] Customer created for User: ${userId}`);
      const mockId = `cus_mock_${Math.random().toString(36).substring(7)}`;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: mockId },
      });
      return mockId;
    }

    const customer = await client.customers.create({
      email,
      name,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  public static async createCheckoutSession(userId: string, plan: "MONTHLY" | "YEARLY"): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await this.createCustomer(userId, user.email, user.name || "");
    }

    const client = this.getClient();
    if (!client) {
      // Mock mode: upgrade user immediately in DB, then redirect to dashboard
      console.log(`[MOCK STRIPE] Checkout initiated for User: ${userId}, Plan: ${plan}`);
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (plan === "MONTHLY" ? 1 : 12));
      await prisma.user.update({
        where: { id: userId },
        data: { plan, role: "PREMIUM", planExpiresAt: expiresAt },
      });
      // Use Railway URL or fallback to relative path
      const baseUrl = env.NEXT_PUBLIC_APP_URL?.startsWith("http")
        ? env.NEXT_PUBLIC_APP_URL
        : "https://aura-production-27e1.up.railway.app";
      return `${baseUrl}/tr/dashboard?upgraded=true&plan=${plan}`;
    }

    const priceId = PLANS[plan].priceId;
    const baseUrl = env.NEXT_PUBLIC_APP_URL?.startsWith("http")
      ? env.NEXT_PUBLIC_APP_URL
      : "https://aura-production-27e1.up.railway.app";

    const session = await client.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/tr/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/tr/pricing`,
      metadata: { userId, plan },
    });

    return session.url!;
  }

  public static async createPortalSession(customerId: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      console.log(`[MOCK STRIPE] Billing Portal initiated for Customer: ${customerId}`);
      return `${env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?portal=mock`;
    }

    const session = await client.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    });

    return session.url;
  }

  public static async handleWebhook(body: Buffer, signature: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      console.warn("⚠️ Stripe secret keys are mock. Webhook signatures skipped.");
      return;
    }

    let event: Stripe.Event;

    try {
      event = client.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      throw new Error(`Signature verification failed: ${err.message}`);
    }

    // Idempotency check: process each event ID once
    const eventId = event.id;
    const existingLog = await prisma.auditLog.findFirst({
      where: { action: `STRIPE_EVENT_PROCESSED_${eventId}` },
    });

    if (existingLog) {
      console.log(`ℹ️ Stripe Event ${eventId} was already processed. Skipping.`);
      return;
    }

    console.log(`🔔 Stripe Webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "MONTHLY" | "YEARLY";
        const subscriptionId = session.subscription as string;

        if (userId && plan && subscriptionId) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + (plan === "MONTHLY" ? 1 : 12));

          await prisma.$transaction([
            prisma.user.update({
              where: { id: userId },
              data: {
                plan,
                role: "PREMIUM",
                planExpiresAt: expiresAt,
              },
            }),
            prisma.subscription.upsert({
              where: { stripeSubscriptionId: subscriptionId },
              update: {
                status: "active",
                currentPeriodStart: new Date(),
                currentPeriodEnd: expiresAt,
              },
              create: {
                userId,
                stripeSubscriptionId: subscriptionId,
                status: "active",
                currentPeriodStart: new Date(),
                currentPeriodEnd: expiresAt,
              },
            }),
          ]);

          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            await EmailService.sendPaymentSuccess(
              user.email,
              plan === "MONTHLY" ? "Aylık" : "Yıllık",
              plan === "MONTHLY" ? "$9.99" : "$79.99"
            );
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user && subscriptionId) {
          // Log invoice in DB
          await prisma.invoice.create({
            data: {
              userId: user.id,
              stripeInvoiceId: invoice.id,
              stripePaymentIntentId: invoice.payment_intent as string || null,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "paid",
              invoicePdf: invoice.invoice_pdf || null,
              periodStart: new Date(invoice.period_start * 1000),
              periodEnd: new Date(invoice.period_end * 1000),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          // Trigger Failed Payment email alert (grace period)
          await EmailService.sendPaymentFailed(user.email);

          // Apply 3 days grace period
          const graceExpires = new Date();
          graceExpires.setDate(graceExpires.getDate() + 3);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              planExpiresAt: graceExpires,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          const status = subscription.status;
          const plan = status === "active" ? (user.plan === "FREE" ? "MONTHLY" : user.plan) : "FREE";
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: plan as any,
              role: plan === "FREE" ? "FREE" : "PREMIUM",
              planExpiresAt: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              role: "FREE",
              planExpiresAt: null,
            },
          });

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: "canceled" },
          });

          await EmailService.sendSubscriptionCanceled(user.email, new Date().toLocaleDateString("tr-TR"));
        }
        break;
      }
    }

    // Register idempotency log
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: `STRIPE_EVENT_PROCESSED_${eventId}`,
        entity: "Stripe",
        entityId: eventId,
        newValues: { type: event.type },
        ipAddress: "127.0.0.1",
      },
    });
  }
}
