"use client";

import { useEffect, useState } from "react";
import { EconomicCalendar } from "../../../components/EconomicCalendar";
import { NewsDetailPanel } from "../../../components/NewsDetailPanel";
import { ReactionChart } from "../../../components/ReactionChart";
import { DashboardTour } from "../../../components/DashboardTour";
import { toast, Toaster } from "@aura/ui";

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // Chart data state
  const [chartTitle, setChartTitle] = useState("XAUUSD Reaksiyon Grafiği");
  const [chartData, setChartData] = useState<number[]>([]);
  const [historicalLines, setHistoricalLines] = useState<any[]>([]);

  // 1. Fetch user data to determine premium state
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/auth/me", { headers, credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const u = data?.user;
        setIsPremium(u && (u.role === "PREMIUM" || u.role === "ADMIN" || u.plan !== "FREE"));
      })
      .catch(() => setIsPremium(false));
  }, []);

  // Show upgrade success toast when redirected back from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      const plan = params.get("plan") || "";
      toast.success(`🌟 Premium Üyelik Aktif! ${plan === "YEARLY" ? "Yıllık" : "Aylık"} planınız başladı.`);
      // Remove query param without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.toString());
      // Reload to refresh premium state
      setTimeout(() => window.location.reload(), 1500);
    }
  }, []);

  // 2. Fetch news events from database
  const fetchEvents = () => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        if (data.length > 0 && !selectedEvent) {
          setSelectedEvent(data[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Haber verileri yüklenemedi.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 3. Listen to select_event custom event from Command Palette
  useEffect(() => {
    const handleSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedEvent(customEvent.detail);
        setChartData([]); // Reset chart data on event change
        setHistoricalLines([]);
      }
    };
    window.addEventListener("select_event", handleSelect);
    return () => window.removeEventListener("select_event", handleSelect);
  }, []);

  // 4. Default baseline data for chart if none loaded
  const displayChartData = chartData.length > 0 ? chartData : Array.from({ length: 120 }).map((_, i) => {
    // Return baseline price
    return 2330 + Math.sin(i / 10) * 2 + (Math.random() - 0.5) * 0.4;
  });

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <Toaster />
      <DashboardTour />
      
      {/* Left Economic Calendar Panel */}
      <div id="economic-calendar-tour" className="flex shrink-0">
        <EconomicCalendar
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={(ev) => {
            setSelectedEvent(ev);
            setChartData([]);
            setHistoricalLines([]);
            setChartTitle(`${ev.titleEn} - XAUUSD Tepki Beklentisi`);
          }}
          onEventsUpdated={(updated) => {
            setEvents(updated);
            if (selectedEvent) {
              const match = updated.find((ev) => ev.id === selectedEvent.id);
              if (match) setSelectedEvent(match);
            }
          }}
        />
      </div>

      {/* Middle Detail and Simulator Panel */}
      <div id="news-detail-tour" className="flex-1 overflow-y-auto h-full">
        {selectedEvent ? (
          <NewsDetailPanel
            event={selectedEvent}
            isPremium={isPremium}
            onLoadHistoricalChart={(title, path) => {
              setChartTitle(title);
              setChartData(path);
            }}
          />
        ) : (
          <div className="flex-1 h-full flex items-center justify-center text-text-muted">
            Lütfen sol ekonomik takvimden veya Ctrl+K panelinden bir haber seçin.
          </div>
        )}
      </div>

      {/* Right Reaction Chart Panel */}
      <div id="reaction-chart-tour" className="flex shrink-0">
        <ReactionChart
          chartTitle={chartTitle}
          dataPoints={displayChartData}
          historicalOverlayLines={historicalLines}
        />
      </div>
    </div>
  );
}
