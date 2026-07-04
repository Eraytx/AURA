import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: any = {
    database: { status: "unhealthy", latencyMs: 0 },
    redis: { status: "unhealthy", latencyMs: 0 },
    claudeApi: { status: "healthy", latencyMs: 0 },
    stripeApi: { status: "healthy" },
    resendApi: { status: "healthy" },
  };

  let overallStatus = "healthy";

  // 1. Check Database (PostgreSQL)
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = "healthy";
    checks.database.latencyMs = Date.now() - dbStart;
  } catch (err) {
    overallStatus = "degraded";
    checks.database.status = "unhealthy";
  }

  // 2. Check Redis (Upstash)
  const redisStart = Date.now();
  try {
    if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_URL !== "") {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_URL,
        token: env.UPSTASH_REDIS_TOKEN || "",
      });
      await redis.ping();
      checks.redis.status = "healthy";
      checks.redis.latencyMs = Date.now() - redisStart;
    } else {
      checks.redis.status = "degraded (mock local)";
    }
  } catch (err) {
    overallStatus = "degraded";
    checks.redis.status = "unhealthy";
  }

  // 3. Verify Claude Anthropic key is loaded
  if (!env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY === "sk-ant-123") {
    checks.claudeApi.status = "degraded (mock fallback)";
  }

  // 4. Verify Stripe key is loaded
  if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY === "sk_test_mock") {
    checks.stripeApi.status = "degraded (mock sandbox)";
  }

  // 5. Verify Resend key is loaded
  if (!env.RESEND_API_KEY) {
    checks.resendApi.status = "degraded (mock mailer)";
  }

  return NextResponse.json({
    status: overallStatus,
    version: "1.0.0-sprint4",
    timestamp,
    checks,
  });
}
