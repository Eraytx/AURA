import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    start(controller) {
      // Keepalive heartbeat ping interval (every 25s to prevent proxy timeout)
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      // Redis is not configured in production — SSE will stay alive via heartbeats only
      // Real-time news events can be pushed here when a Redis/Upstash connection is added
      console.log("[SSE] Client connected. Heartbeat mode active (no Redis configured).");

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        console.log("[SSE] Client disconnected.");
      });
    },
    cancel() {
      // Stream cancelled
    },
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering (needed for Railway/Vercel)
    },
  });
}
