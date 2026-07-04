"use client";

import { useState, useMemo, useRef } from "react";
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
} from "recharts";
import { Card, Button, toast } from "@aura/ui";
import { Download, ZoomIn, ZoomOut, RefreshCw, Layers } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"reaction" | "live" | "announcement">("reaction");
  const [zoomLevel, setZoomLevel] = useState(1); // 1 to 3

  // Format single path data for Recharts
  const chartData = useMemo(() => {
    // Generate data from -30 to +90
    return dataPoints.map((price, idx) => {
      const time = idx - 30;
      const row: any = { time, price };
      
      // Merge historical overlays if any
      historicalOverlayLines.forEach((line) => {
        if (line.data[idx] !== undefined) {
          row[line.label] = line.data[idx];
        }
      });

      return row;
    });
  }, [dataPoints, historicalOverlayLines]);

  // Handle zoom: sliced dataset
  const zoomedData = useMemo(() => {
    if (zoomLevel === 1) return chartData;
    const sliceCount = Math.floor(chartData.length / (zoomLevel * 1.5));
    // Focus around release time t=0 (index 30)
    const start = Math.max(0, 30 - Math.floor(sliceCount / 3));
    const end = Math.min(chartData.length, start + sliceCount);
    return chartData.slice(start, end);
  }, [chartData, zoomLevel]);

  // Export Recharts SVG as PNG image
  const handleExportPng = () => {
    if (!chartRef.current) return;
    try {
      const svgElement = chartRef.current.querySelector("svg");
      if (!svgElement) throw new Error();

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = svgElement.clientWidth * 2; // high res
        canvas.height = svgElement.clientHeight * 2;
        const context = canvas.getContext("2d");
        
        if (context) {
          context.fillStyle = "#0D0D0D"; // Dark theme background
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.scale(2, 2);
          context.drawImage(image, 0, 0);

          const png = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = png;
          downloadLink.download = "aura_xauusd_reaction_chart.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
      toast.success("Grafik görseli indiriliyor.");
    } catch {
      toast.error("Grafik dışa aktarılamadı.");
    }
  };

  const hasOverlay = historicalOverlayLines.length > 0;

  return (
    <div className="w-96 border-l border-border bg-background-secondary/40 flex flex-col h-full select-none">
      
      {/* 1. Header controls */}
      <div className="p-4 border-b border-border flex flex-col gap-3.5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Grafik Paneli
        </span>
        <h2 className="text-sm font-bold text-text-primary truncate">{chartTitle}</h2>

        {/* Tab switcher */}
        <div className="flex bg-background-primary p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab("reaction")}
            className={`flex-1 text-[10px] py-1.5 font-bold uppercase tracking-wider rounded-md transition-all ${
              activeTab === "reaction" ? "bg-background-card text-gold shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Tepki Beklentisi
          </button>
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 text-[10px] py-1.5 font-bold uppercase tracking-wider rounded-md transition-all ${
              activeTab === "live" ? "bg-background-card text-gold shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            Canlı Piyasa
          </button>
        </div>
      </div>

      {/* 2. Chart Workspace */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <Card className="flex-1 min-h-[260px] p-2 bg-background-card border-border/40 flex flex-col relative" ref={chartRef}>
          {chartData.length === 0 || dataPoints.length === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-text-muted/65 text-center">
              Reaksiyon grafiğini yüklemek için soldan bir haber seçin veya simülatörü çalıştırın.
            </div>
          ) : (
            <>
              {/* Zoom Buttons Overlay */}
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
                    <XAxis
                      dataKey="time"
                      stroke="#999890"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}dk`}
                    />
                    <YAxis
                      stroke="#999890"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                      tickFormatter={(val) => `$${val.toFixed(1)}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1A1A", borderColor: "rgba(255,255,255,0.08)" }}
                      labelStyle={{ color: "#D4A017", fontWeight: "bold", fontSize: 11 }}
                      itemStyle={{ color: "#F0EDE6", fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    
                    {/* Vertical reference line at release event (t=0) */}
                    <ReferenceLine x={0} stroke="#E24B4A" strokeDasharray="3 3" strokeWidth={1} label={{ value: "AÇIKLAMA", fill: "#E24B4A", fontSize: 8, position: "top" }} />

                    {/* Single Main Gold Line */}
                    {!hasOverlay && (
                      <Line
                        type="monotone"
                        dataKey="price"
                        name="XAUUSD"
                        stroke="#D4A017"
                        strokeWidth={1.75}
                        dot={false}
                      />
                    )}

                    {/* Multiple Overlay Lines */}
                    {hasOverlay &&
                      historicalOverlayLines.map((line, idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={line.label}
                          name={line.label}
                          stroke={line.color}
                          strokeWidth={1.25}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>

        {/* Action Controls */}
        {chartData.length > 0 && (
          <Button onClick={handleExportPng} variant="secondary" className="w-full flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            <span>Grafiği PNG Olarak İndir</span>
          </Button>
        )}
      </div>

    </div>
  );
}
