"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, toast, Badge, Skeleton } from "@aura/ui";
import { Cpu, Info, Sliders, Star, HelpCircle, Lock } from "lucide-react";

interface NewsAnalysis {
  id: string;
  expectation: string;
  sentiment: number;
  sentimentLabel: string;
  aiImpactScore: number;
  volatilityScore: number;
  confidenceScore: number;
  deviationAnalysis: string; // stringified object
  historicalJson: string; // stringified array
}

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
  category: string;
  analyses: NewsAnalysis[];
}

interface NewsDetailPanelProps {
  event: NewsEvent;
  isPremium: boolean;
  onLoadHistoricalChart: (date: string, chartData: any) => void;
}

export function NewsDetailPanel({
  event,
  isPremium,
  onLoadHistoricalChart,
}: NewsDetailPanelProps) {
  const [favorite, setFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  // Simulator state
  const [simValue, setSimValue] = useState("");
  const [simResult, setSimResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Check if event is in user favorites and retrieve analysis
  useEffect(() => {
    setAnalysisLoading(true);
    setSimResult(null);
    setSimValue("");

    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 1. Fetch Analysis
    fetch(`/api/news/${event.id}/analysis`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((d) => {
        setAnalysis(d.data);
        setAnalysisLoading(false);
      })
      .catch(() => {
        setAnalysis(null);
        setAnalysisLoading(false);
      });

    // 2. Fetch Favorites Status
    if (token) {
      fetch("/api/news/favorites", { headers })
        .then((res) => res.json())
        .then((d) => {
          const list = d.data || [];
          setFavorite(list.some((fav: any) => fav.id === event.id));
        })
        .catch(() => {});
    }
  }, [event]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.warning("Lütfen favorilere eklemek için giriş yapın.");
      return;
    }

    setFavLoading(true);
    try {
      const res = await fetch(`/api/news/${event.id}/favorite`, {
        method: favorite ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFavorite(!favorite);
      toast.success(favorite ? "Favorilerden çıkarıldı." : "Favorilere eklendi.");
    } catch {
      toast.error("İşlem gerçekleştirilemedi.");
    } finally {
      setFavLoading(false);
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) return;
    if (!simValue.trim()) {
      toast.warning("Lütfen simüle edilecek bir değer girin.");
      return;
    }

    setSimLoading(true);
    setSimResult(null);

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/news/${event.id}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ simulatedValue: simValue }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);

      setSimResult(d.data);
    } catch (err: any) {
      toast.error(err.message || "Simülasyon hesaplanamadı.");
    } finally {
      setSimLoading(false);
    }
  };

  const loadPastChart = (match: any) => {
    // Generate static reaction chart data for testing
    const basePrice = 2330;
    const directionFactor = match.direction === "up" ? 1 : -1;
    const path = Array.from({ length: 120 }).map((_, idx) => {
      if (idx < 30) return basePrice + (Math.random() - 0.5) * 0.3;
      const progress = idx - 30;
      return basePrice + progress * 0.2 * directionFactor + (Math.random() - 0.5) * 0.4;
    });

    onLoadHistoricalChart(`${match.date} (${match.actual})`, path);
  };

  // Calculate deviations
  const hasActual = event.actual && event.actual !== "";
  let deviationText = "";
  let isDeviationPositive = false;

  if (hasActual && event.forecast) {
    const numActual = parseFloat(event.actual.replace(/[^\d.-]/g, "")) || 0;
    const numForecast = parseFloat(event.forecast.replace(/[^\d.-]/g, "")) || 0;
    const diff = numActual - numForecast;
    deviationText = `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`;
    isDeviationPositive = diff >= 0;
  }

  // Parse expectations & historical matches
  const parsedDeviation = analysis?.deviationAnalysis
    ? typeof analysis.deviationAnalysis === "string"
      ? JSON.parse(analysis.deviationAnalysis)
      : analysis.deviationAnalysis
    : null;

  const historicalMatches = analysis?.historical
    ? typeof analysis.historical === "string"
      ? JSON.parse(analysis.historical)
      : analysis.historical
    : [];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-background-primary h-full select-none">
      
      {/* 1. Header and Basic Details */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{event.titleEn}</h1>
            <p className="text-xs text-text-muted mt-1">{event.title} • {event.category || "Ekonomik Haber"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={toggleFavorite}
              loading={favLoading}
              className={`h-9 px-3 flex items-center gap-1.5 ${favorite ? "text-gold" : "text-text-muted"}`}
            >
              <Star className="h-4 w-4 fill-current" />
              <span>{favorite ? "Favorilerde" : "Favoriye Ekle"}</span>
            </Button>
            <Badge variant={event.impact.toLowerCase() as any}>{event.impact} Impact</Badge>
          </div>
        </div>

        {/* 3 Grid Value Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="flex flex-col items-center justify-center p-4 bg-background-card">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Açıklanan</span>
            <span className="text-lg font-bold text-text-primary">{event.actual || "—"}</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-4 bg-background-card">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Beklenti</span>
            <span className="text-lg font-bold text-gold">{event.forecast || "—"}</span>
          </Card>
          <Card className="flex flex-col items-center justify-center p-4 bg-background-card">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Önceki</span>
            <span className="text-lg font-bold text-text-muted">{event.previous || "—"}</span>
          </Card>
        </div>

        {/* Deviation Display */}
        {hasActual && deviationText !== "" && (
          <div className={`p-3.5 rounded-lg border text-xs font-semibold flex justify-between items-center ${
            isDeviationPositive ? "bg-green/10 border-green/20 text-green" : "bg-red/10 border-red/20 text-red"
          }`}>
            <span>Beklenti Sapması (Deviation):</span>
            <span className="font-mono text-sm">{deviationText}</span>
          </div>
        )}
      </div>

      {/* 2. AI Analysis Block */}
      {analysisLoading ? (
        <Skeleton className="h-44 w-full rounded-lg" />
      ) : analysis ? (
        <div className="flex flex-col gap-6">
          <Card className="bg-background-secondary/30 border-border/40 flex flex-col gap-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-gold flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              Yapay Zeka Analiz ve Piyasa Beklentisi
            </h3>
            <p className="text-sm text-text-primary leading-relaxed">{analysis.expectation}</p>

            {/* Gauge indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 border-t border-border/40 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Duyarlılık Puanı</span>
                <span className="text-sm font-bold text-gold">{analysis.sentimentLabel || "Yatay"} ({analysis.sentiment}%)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">AI Etki Skoru</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">{analysis.aiImpactScore}/10</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${(analysis.aiImpactScore || 5) * 10}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Volatilite Skoru</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">{analysis.volatilityScore}/10</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red" style={{ width: `${(analysis.volatilityScore || 5) * 10}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Güven Puanı</span>
                <span className="text-sm font-bold text-green">{analysis.confidenceScore || 80}%</span>
              </div>
            </div>
          </Card>

          {/* Theoretical impact cards */}
          {parsedDeviation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-green/5 border-green/20 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-green uppercase tracking-wider">Altın Alış Senaryosu</span>
                <p className="text-xs text-green/90 leading-relaxed">{parsedDeviation.bearishScenario || parsedDeviation.bullishScenario}</p>
              </Card>
              <Card className="bg-red/5 border-red/20 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-red uppercase tracking-wider">Altın Satış Senaryosu</span>
                <p className="text-xs text-red/90 leading-relaxed">{parsedDeviation.bullishScenario || parsedDeviation.bearishScenario}</p>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-6 text-text-muted">
          <Info className="h-6 w-6 text-gold/60 mb-2" />
          <span>Bu haber için henüz yapay zeka analizi oluşturulmadı.</span>
        </Card>
      )}

      {/* 3. Simulator (Premium Gated) */}
      <div id="simulator-tour" className="relative">
        {!isPremium && (
          <div className="absolute inset-0 bg-background-primary/60 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center border border-border/40 rounded-xl p-6 text-center select-none">
            <Lock className="h-8 w-8 text-gold mb-3" />
            <h4 className="text-sm font-bold text-text-primary mb-1">Premium Simülatör Özelliği</h4>
            <p className="text-xs text-text-muted max-w-[280px] mb-4">
              Açıklanacak değere göre altının anlık pip reaksiyonunu hesaplamak için üyeliğinizi yükseltin.
            </p>
            <Button size="sm" className="px-5">Şimdi Yükselt</Button>
          </div>
        )}

        <Card className={`border-border/40 bg-background-card ${!isPremium ? "blur-[1.5px]" : ""}`}>
          <h3 className="text-xs uppercase font-bold tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-gold" />
            Haber Etki Simülatörü
          </h3>
          <p className="text-xs text-text-muted leading-relaxed mb-4">
            Beklenti dışı gelebilecek sürpriz değerlere göre XAUUSD'deki pip hareket yönünü simüle edin.
          </p>

          <form onSubmit={handleSimulate} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Simüle Edilecek Değer"
                placeholder={`Örn: ${event.forecast || "0.2%"}`}
                value={simValue}
                onChange={(e) => setSimValue(e.target.value)}
                disabled={!isPremium}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSimValue(event.forecast || "")}
                disabled={!isPremium}
                className="h-10 text-xs px-3"
              >
                Beklentiyi Yaz
              </Button>
              <Button type="submit" loading={simLoading} disabled={!isPremium} className="h-10 text-xs px-5">
                Simüle Et
              </Button>
            </div>
          </form>

          {simResult && (
            <div className="mt-4 p-4 border border-border/50 bg-background-secondary/30 rounded-lg flex flex-col gap-1.5 animate-in fade-in-50 duration-200">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Beklenen Yön:</span>
                <span className={simResult.direction === "up" ? "text-green" : simResult.direction === "down" ? "text-red" : "text-text-muted"}>
                  {simResult.direction === "up" ? "ALTIN ALIS (UP)" : simResult.direction === "down" ? "ALTIN SATIS (DOWN)" : "YATAY (NEUTRAL)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Tahmini Pip Hareketi:</span>
                <span className="font-mono text-gold">{simResult.pipMovement} Pips</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mt-1">{simResult.description}</p>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Historical Reactions (Premium Gated) */}
      <div className="relative">
        {!isPremium && (
          <div className="absolute inset-0 bg-background-primary/60 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center border border-border/40 rounded-xl p-6 text-center select-none">
            <Lock className="h-8 w-8 text-gold mb-3" />
            <h4 className="text-sm font-bold text-text-primary mb-1">Geçmiş Benzer Haberler</h4>
            <p className="text-xs text-text-muted max-w-[280px] mb-4">
              Geçmiş 5 yıla ait benzer verilerdeki altın reaksiyonlarını ve aksiyon listesini görmek için yükseltin.
            </p>
            <Button size="sm" className="px-5">Şimdi Yükselt</Button>
          </div>
        )}

        <div className={!isPremium ? "blur-[1.5px]" : ""}>
          <h3 className="text-xs uppercase font-bold tracking-wider text-text-muted mb-3">
            Geçmiş Benzer Haberler ve Altın Tepkileri
          </h3>
          <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Tarih</th>
                  <th className="p-3">Beklenti</th>
                  <th className="p-3">Açıklanan</th>
                  <th className="p-3">Sapma</th>
                  <th className="p-3">Altın Tepkisi</th>
                  <th className="p-3">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {historicalMatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-text-muted/60">Bu kategori için geçmiş veri kaydı bulunmuyor.</td>
                  </tr>
                ) : (
                  historicalMatches.map((match: any, idx: number) => {
                    const isPositive = match.direction === "up";
                    return (
                      <tr key={idx} className="border-b border-border last:border-0 hover:bg-background-secondary/10">
                        <td className="p-3 font-medium">{match.date}</td>
                        <td className="p-3 font-mono">{match.forecast}</td>
                        <td className="p-3 font-mono">{match.actual}</td>
                        <td className={`p-3 font-mono ${match.deviation.includes("-") ? "text-green" : "text-red"}`}>{match.deviation}</td>
                        <td className={`p-3 font-mono font-bold ${isPositive ? "text-green" : "text-red"}`}>{match.xauusdReaction}</td>
                        <td className="p-3">
                          <Button size="sm" variant="secondary" onClick={() => loadPastChart(match)} className="text-[10px] h-7 px-2.5">
                            Grafik Yükle
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

    </div>
  );
}
