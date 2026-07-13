"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge, Input, Button } from "@aura/ui";
import { Search, Calendar, Clock } from "lucide-react";
import { useNewsStream } from "../hooks/useNewsStream";

interface NewsEvent {
  id: string;
  title: string;
  titleEn: string;
  currency: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  forecast: string;
  actual: string;
  previous: string;
  eventTime: string;
  createdAt: string;
}

interface EconomicCalendarProps {
  events: NewsEvent[];
  selectedEvent: NewsEvent | null;
  onSelectEvent: (event: NewsEvent) => void;
  onEventsUpdated: (updatedEvents: NewsEvent[]) => void;
}

/** Calculate countdown string from an HH:mm eventTime string (assumed today/next occurrence) */
function useCountdown(eventTime: string): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const compute = () => {
      if (!eventTime || !eventTime.includes(":")) {
        setLabel(eventTime || "—");
        return;
      }
      const [hStr, mStr] = eventTime.split(":");
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (isNaN(h) || isNaN(m)) {
        setLabel(eventTime);
        return;
      }

      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);

      // If already passed today, show as "Açıklandı"
      const diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        setLabel(`${eventTime} • Açıklandı`);
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (hours > 0) {
        setLabel(`${eventTime} • ${hours}s ${mins}dk`);
      } else if (mins > 0) {
        setLabel(`${eventTime} • ${mins}dk ${secs}sn`);
      } else {
        setLabel(`${eventTime} • ${secs}sn`);
      }
    };

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [eventTime]);

  return label;
}

/** Single event row with its own countdown */
function EventRow({
  event,
  isSelected,
  onSelectEvent,
}: {
  event: NewsEvent;
  isSelected: boolean;
  onSelectEvent: (e: NewsEvent) => void;
}) {
  const countdown = useCountdown(event.eventTime);

  return (
    <div
      className={`h-full p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
        isSelected
          ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,160,23,0.04)]"
          : "border-border bg-background-card hover:bg-background-secondary"
      }`}
      onClick={() => onSelectEvent(event)}
    >
      <div className="flex justify-between items-start gap-1">
        <span className="text-xs font-bold text-text-primary truncate max-w-[150px]">
          {event.titleEn}
        </span>
        <Badge variant={event.impact.toLowerCase() as any}>{event.impact}</Badge>
      </div>

      <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
        <span className="flex items-center gap-1 text-gold/80 font-mono">
          <Clock className="h-3 w-3" />
          {countdown}
        </span>
      </div>

      <div className="flex gap-2 text-[10px] text-text-muted mt-1">
        <span>Bek: <strong className="text-text-primary">{event.forecast || "—"}</strong></span>
        <span>Ger: <strong className={event.actual ? "text-gold" : "text-text-muted"}>{event.actual || "—"}</strong></span>
        <span>Önc: <strong className="text-text-muted">{event.previous || "—"}</strong></span>
      </div>
    </div>
  );
}

export function EconomicCalendar({
  events,
  selectedEvent,
  onSelectEvent,
  onEventsUpdated,
}: EconomicCalendarProps) {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [usdOnly, setUsdOnly] = useState(true);
  const [highOnly, setHighOnly] = useState(true);

  // Subscribe to real-time events via custom SSE hook
  useNewsStream((newEvent) => {
    const nextEvents = events.map((ev) => (ev.id === newEvent.id ? newEvent : ev));
    if (!events.some((ev) => ev.id === newEvent.id)) {
      nextEvents.unshift(newEvent);
    }
    onEventsUpdated(nextEvents);
  });

  // Filter events
  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.titleEn.toLowerCase().includes(search.toLowerCase());
      const matchUsd = !usdOnly || e.currency === "USD";
      const matchHigh = !highOnly || e.impact === "HIGH";
      return matchSearch && matchUsd && matchHigh;
    });
  }, [events, search, usdOnly, highOnly]);

  // Group by Date
  const virtualRows = useMemo(() => {
    const rows: ({ type: "header"; date: string } | { type: "item"; event: NewsEvent })[] = [];
    const grouped: { [key: string]: NewsEvent[] } = {};

    filtered.forEach((e) => {
      const dateStr = new Date(e.createdAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(e);
    });

    Object.keys(grouped).forEach((date) => {
      rows.push({ type: "header", date });
      grouped[date].forEach((event) => {
        rows.push({ type: "item", event });
      });
    });

    return rows;
  }, [filtered]);

  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => listContainerRef.current,
    estimateSize: (index) => (virtualRows[index]?.type === "header" ? 36 : 104),
    overscan: 10,
  });

  return (
    <div className="w-80 flex flex-col border-r border-border bg-background-secondary h-full select-none">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-border flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" />
          Ekonomik Takvim
        </span>

        <Input
          placeholder="Haber ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="h-9"
        />

        <div className="flex items-center gap-2">
          <Button
            variant={usdOnly ? "primary" : "secondary"}
            onClick={() => setUsdOnly(!usdOnly)}
            className="flex-1 text-xs h-8"
          >
            Sadece USD
          </Button>
          <Button
            variant={highOnly ? "primary" : "secondary"}
            onClick={() => setHighOnly(!highOnly)}
            className="flex-1 text-xs h-8"
          >
            Yüksek Etki
          </Button>
        </div>
      </div>

      {/* Virtualized Events list */}
      <div ref={listContainerRef} className="flex-1 overflow-y-auto p-4 relative">
        {virtualRows.length === 0 ? (
          <div className="text-center text-xs text-text-muted/50 py-12">Haber bulunamadı.</div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = virtualRows[virtualRow.index];
              if (!row) return null;

              if (row.type === "header") {
                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="flex items-center px-1 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-background-secondary py-1 z-10"
                  >
                    {row.date}
                  </div>
                );
              }

              const { event } = row;
              const isSelected = selectedEvent?.id === event.id;

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: "8px",
                  }}
                >
                  <EventRow
                    event={event}
                    isSelected={isSelected}
                    onSelectEvent={onSelectEvent}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
