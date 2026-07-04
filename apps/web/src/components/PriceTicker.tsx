"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface PriceData {
  price: number;
  change: number;
  changePercent: number;
}

interface TickerResponse {
  gold: PriceData;
  dxy: PriceData;
}

export function PriceTicker() {
  const [data, setData] = useState<TickerResponse | null>(null);
  const [goldFlash, setGoldFlash] = useState<"up" | "down" | null>(null);
  const [dxyFlash, setDxyFlash] = useState<"up" | "down" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      const res = await fetch("/api/live-ticker");
      if (!res.ok) throw new Error();
      const nextData: TickerResponse = await res.json();

      if (data) {
        // Calculate flashing for Gold
        if (nextData.gold.price > data.gold.price) {
          setGoldFlash("up");
        } else if (nextData.gold.price < data.gold.price) {
          setGoldFlash("down");
        }

        // Calculate flashing for DXY
        if (nextData.dxy.price > data.dxy.price) {
          setDxyFlash("up");
        } else if (nextData.dxy.price < data.dxy.price) {
          setDxyFlash("down");
        }

        // Reset flashes after 1 second
        setTimeout(() => {
          setGoldFlash(null);
          setDxyFlash(null);
        }, 1000);
      }

      setData(nextData);
      setLoading(false);
    } catch (err) {
      console.warn("Failed to fetch live prices in component.");
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // every 30s
    return () => clearInterval(interval);
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-4 text-xs text-text-muted font-mono animate-pulse">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Piyasa verileri yükleniyor...</span>
      </div>
    );
  }

  const isGoldUp = data.gold.changePercent >= 0;
  const isDxyUp = data.dxy.changePercent >= 0;

  return (
    <div className="flex items-center gap-6 font-mono text-xs select-none">
      {/* 1. GOLD (XAUUSD) Ticker */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-all duration-300 ${
          goldFlash === "up"
            ? "border-green bg-green/10 text-green scale-105"
            : goldFlash === "down"
              ? "border-red bg-red/10 text-red scale-105"
              : "border-border bg-background-primary text-text-primary"
        }`}
      >
        <span className="font-bold tracking-wider text-text-muted">XAUUSD:</span>
        <span className="font-bold">${data.gold.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span
          className={`flex items-center gap-0.5 text-[10px] font-semibold ${
            isGoldUp ? "text-green" : "text-red"
          }`}
        >
          {isGoldUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isGoldUp ? "+" : ""}
          {data.gold.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* 2. DXY Ticker */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-all duration-300 ${
          dxyFlash === "up"
            ? "border-green bg-green/10 text-green scale-105"
            : dxyFlash === "down"
              ? "border-red bg-red/10 text-red scale-105"
              : "border-border bg-background-primary text-text-primary"
        }`}
      >
        <span className="font-bold tracking-wider text-text-muted">DXY Index:</span>
        <span className="font-bold">{data.dxy.price.toFixed(2)}</span>
        <span
          className={`flex items-center gap-0.5 text-[10px] font-semibold ${
            isDxyUp ? "text-green" : "text-red"
          }`}
        >
          {isDxyUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isDxyUp ? "+" : ""}
          {data.dxy.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
