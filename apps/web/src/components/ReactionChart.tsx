"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { Card, Button, toast } from "@aura/ui";
import { Download, ZoomIn, ZoomOut, TrendingUp, Activity } from "lucide-react";

interface ReactionChartProps {
  chartTitle: string;
  dataPoints: number[]; // 120 items
  historicalOverlayLines?: { label: string; data: number[]; color: string }[];
}

export function ReactionChart({
  chartTitle,
  dataPoints,
  historicalOverlayLines = [],
}: ReactionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"reaction" | "live">("reaction");
  const [zoomLevel, setZoomLevel] = useState(1);

  // ─── Live Market State ───────────────────────────────────────────
  const [liveData, setLiveData] = useState<{ time: string; price: number; dxy: number }[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveTick = async () => {
    try {
      const res = await fetch("/api/live-ticker");
      if (!res.ok) return;
      const d = await res.json();
      const now = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLiveData((prev) => {
        const next = [...prev, { time: now, price: d.gold?.price ?? 0, dxy: d.dxy?.price ?? 0 }];
        return next.slice(-60); // keep last 60 ticks
      });
    } catch {}
  };

  useEffect(() => {
    if (activeTab === "live") {
      setLiveLoading(true);
      fetchLiveTick().then(() => setLiveLoading(false));
      liveIntervalRef.current = setInterval(fetchLiveTick, 10000); // refresh every 10s
    } else {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [activeTab]);

  // ─── Reaction Chart Data ─────────────────────────────────────────
  const chartData = useMemo(() => {
    return dataPoints.map((price, idx) => {
      const time = idx - 30;
      const row: any = { time, price };
      historicalOverlayLines.forEach((line) => {
        if (line.data[idx] !== undefined) row[line.label] = line.data[idx];
      });
      return row;
    });
  }, [dataPoints, historicalOverlayLines]);

  const zoomedData = useMemo(() => {
    if (zoomLevel === 1) return chartData;
    const sliceCount = Math.floor(chartData.length / (zoomLevel * 1.5));
    const start = Math.max(0, 30 - Math.floor(sliceCount / 3));
    const end = Math.min(chartData.length, start + sliceCount);
    return chartData.slice(start, end);
  }, [chartData, zoomLevel]);

  const hasOverlay = historicalOverlayLines.length > 0;

  // ─── PNG Export ──────────────────────────────────────────────────
  const handleExportPng = () => {
    if (!chartRef.current) return;
    try {
      const svgElement = chartRef.current.querySelector("svg");
      if (!svgElement) throw new Error();
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = svgElement.clientWidth * 2;
        canvas.height = svgElement.clientHeight * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#0D0D0D";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(2, 2);
          ctx.drawImage(image, 0, 0);
          const png = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = png;
          a.download = "aura_xauusd_chart.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      };
      image.src = blobURL;
      toast.success("Grafik indiriliyor.");
    } catch {
      toast.error("Grafik dışa aktarılamadı.");
    }
  };

  // ─── Live price stats ────────────────────────────────────────────
  const latestLive = liveData[liveData.length - 1];
  const firstLive = liveData[0];
  const liveChange = latestLive && firstLive ? (latestLive.price - firstLive.price).toFixed(2) : null;
  const liveChangePct = latestLive && firstLive && firstLive.price > 0
    ? (((latestLive.price - firstLive.price) / firstLive.price) * 100).toFixed(3)
    : null;

  return (
    <div className="w-96 border-l border-border bg-background-secondary/40 flex flex-col h-full select-none">

      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col gap-3.5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Grafik Paneli</span>
        <h2 className="text-sm font-bold text-text-primary truncate">{chartTitle}</h2>

        {/* Tab switcher */}
        <div className="flex bg-background-primary p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab("reaction")}
            className={`flex-1 text-[10px] py-1.5 font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 ${
              activeTab === "reaction" ? "bg-background-card text-gold shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            Tepki Beklentisi
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 text-[10px] py-1.5 font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1 ${
              activeTab === "live" ? "bg-background-card text-gold shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Activity className="h-3 w-3" />
            Canlı Piyasa
          </button>
        </div>
      </div>

      {/* Chart Workspace */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">

        {/* ── REACTION TAB ─────────────────────────────────────── */}
        {activeTab === "reaction" && (
          <Card
            className="flex-1 min-h-[260px] p-2 bg-background-card border-border/40 flex flex-col relative"
            ref={chartRef}
          >
            {chartData.length === 0 || dataPoints.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-xs text-text-muted/65 text-center px-4">
                Reaksiyon grafiğini yüklemek için soldan bir haber seçin veya simülatörü çalıştırın.
              </div>
            ) : (
              <>
                {/* Zoom Controls */}
                <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10">
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, z + 1))}
                    className="p-1.5 bg-background-secondary border border-border hover:border-gold/30 rounded text-text-muted hover:text-text-primary"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
                    className="p-1.5 bg-background-secondary border border-border hover:border-gold/30 rounded text-text-muted hover:text-text-primary"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={zoomedData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="time" stroke="#999890" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}dk`} />
                      <YAxis stroke="#999890" fontSize={10} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(val) => `$${val.toFixed(1)}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1A1A", borderColor: "rgba(255,255,255,0.08)" }}
                        labelStyle={{ color: "#D4A017", fontWeight: "bold", fontSize: 11 }}
                        itemStyle={{ color: "#F0EDE6", fontSize: 11 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      <ReferenceLine x={0} stroke="#E24B4A" strokeDasharray="3 3" strokeWidth={1} label={{ value: "AÇIKLAMA", fill: "#E24B4A", fontSize: 8, position: "top" }} />
                      {!hasOverlay && (
                        <Line type="monotone" dataKey="price" name="XAUUSD" stroke="#D4A017" strokeWidth={1.75} dot={false} />
                      )}
                      {hasOverlay && historicalOverlayLines.map((line, idx) => (
                        <Line key={idx} type="monotone" dataKey={line.label} name={line.label} stroke={line.color} strokeWidth={1.25} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </Card>
        )}

        {/* ── LIVE MARKET TAB ──────────────────────────────────── */}
        {activeTab === "live" && (
          <div className="flex flex-col gap-3 flex-1">
            {/* Live Stats Bar */}
            {latestLive && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background-card border border-border/60 rounded-lg p-3 flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">XAUUSD</span>
                  <span className="text-lg font-bold text-gold">${latestLive.price.toFixed(2)}</span>
                  {liveChange !== null && (
                    <span className={`text-[10px] font-semibold ${parseFloat(liveChange) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {parseFloat(liveChange) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(liveChange)).toFixed(2)} ({liveChangePct}%)
                    </span>
                  )}
                </div>
                <div className="bg-background-card border border-border/60 rounded-lg p-3 flex flex-col gap-0.5">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">DXY Endeksi</span>
                  <span className="text-lg font-bold text-text-primary">{latestLive.dxy.toFixed(2)}</span>
                  <span className="text-[10px] text-text-muted">Dolar Endeksi</span>
                </div>
              </div>
            )}

            {/* Live Chart */}
            <Card className="flex-1 min-h-[220px] p-2 bg-background-card border-border/40 flex flex-col relative">
              {liveLoading && liveData.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-2 text-xs text-text-muted/65">
                  <Activity className="h-5 w-5 animate-pulse text-gold" />
                  <span>Canlı piyasa verisi yükleniyor...</span>
                </div>
              ) : liveData.length < 2 ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-2 text-xs text-text-muted/65 text-center px-4">
                  <Activity className="h-5 w-5 text-gold" />
                  <span>Canlı veri bekleniyor. Grafik 10 saniyede bir güncellenir.</span>
                  <span className="text-[10px] opacity-50">Yahoo Finance · GC=F</span>
                </div>
              ) : (
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4A017" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="time" stroke="#999890" fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis stroke="#999890" fontSize={9} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(val) => `$${val.toFixed(0)}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1A1A1A", borderColor: "rgba(255,255,255,0.08)" }}
                        labelStyle={{ color: "#D4A017", fontWeight: "bold", fontSize: 10 }}
                        itemStyle={{ color: "#F0EDE6", fontSize: 10 }}
                        formatter={(val: number) => [`$${val.toFixed(2)}`, "XAUUSD"]}
                      />
                      <Area type="monotone" dataKey="price" name="XAUUSD" stroke="#D4A017" strokeWidth={1.75} fill="url(#goldGradient)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Live info */}
            <div className="flex items-center justify-between text-[10px] text-text-muted/60">
              <span>Kaynak: Yahoo Finance · GC=F</span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                10sn'de bir güncellenir
              </span>
            </div>
          </div>
        )}

        {/* Export button (reaction tab only) */}
        {activeTab === "reaction" && chartData.length > 0 && (
          <Button onClick={handleExportPng} variant="secondary" className="w-full flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            <span>Grafiği PNG Olarak İndir</span>
          </Button>
        )}
      </div>
    </div>
  );
}
