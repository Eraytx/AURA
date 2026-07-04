import { NextRequest } from "next/server";
import Redis from "ioredis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let redis: Redis | null = null;
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      // Connect to Redis for subscription
      const redisUrl = process.env.UPSTASH_REDIS_URL || "redis://localhost:6379";
      redis = new Redis(redisUrl);

      // Keepalive heartbeat ping interval (every 30s)
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("event: ping\ndata: keepalive\n\n"));
        } catch (err) {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Subscribe to Redis channel
      redis.subscribe("news:high_impact", (err) => {
        if (err) {
          console.error("Redis subscription error in SSE stream:", err);
          controller.close();
        }
      });

      redis.on("message", (channel, message) => {
        try {
          controller.enqueue(encoder.encode(`event: message\ndata: ${message}\n\n`));
        } catch (err) {
          clearInterval(heartbeatInterval);
          redis?.disconnect();
        }
      });

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        redis?.disconnect();
      });
    },
    cancel() {
      redis?.disconnect();
    }
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
