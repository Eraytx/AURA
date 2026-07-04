"use client";

import { useEffect, useRef } from "react";
import { toast } from "@aura/ui";

export function useNewsStream(onNewsReceived: (event: any) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Request notification permission if not asked
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const connectSSE = () => {
      console.log("⚡ Starting Server-Sent Events subscription for news updates...");
      const es = new EventSource("/api/stream/news");
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("📢 Real-time event received via SSE:", event);

          // Invoke callback to update list state
          onNewsReceived(event);

          // Trigger Toast Notification
          toast.info(`🔴 Yeni HIGH impact haber açıklandı: ${event.titleEn}`, {
            description: `Açıklanan: ${event.actual || "—"} / Beklenen: ${event.forecast || "—"}`,
          });

          // Trigger Browser Notification
          if (
            "Notification" in window &&
            Notification.permission === "granted" &&
            document.visibilityState !== "visible"
          ) {
            new Notification(`AURA: ${event.titleEn} Açıklandı`, {
              body: `Açıklanan: ${event.actual || "—"} (Beklenti: ${event.forecast || "—"})`,
              icon: "/favicon.ico",
            });
          }
        } catch (err) {
          console.error("Failed to parse SSE event data:", err);
        }
      };

      es.onerror = () => {
        console.warn("⚠️ SSE connection closed/failed. Reconnecting in 5 seconds...");
        es.close();
        
        // Exponential backoff or standard delay reconnect
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onNewsReceived]);
}
