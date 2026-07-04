"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Badge, toast } from "@aura/ui";
import { Calendar, RefreshCw, Plus, Cpu, Info } from "lucide-react";

export default function AdminNewsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchLoading, setRefetchLoading] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [impact, setImpact] = useState("HIGH");
  const [time, setTime] = useState("");
  const [forecast, setForecast] = useState("");
  const [category, setCategory] = useState("Economic News");
  const [formLoading, setFormLoading] = useState(false);

  const fetchEvents = () => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Haberler yüklenemedi.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) {
      toast.warning("Lütfen başlık ve saat alanlarını doldurun.");
      return;
    }

    setFormLoading(true);
    // Simulate creating a manual news event
    setTimeout(() => {
      const mockNewEvent = {
        id: `mock_ev_${Math.random().toString(36).substring(7)}`,
        title,
        titleEn: title,
        currency,
        impact,
        eventTime: time,
        forecast: forecast || null,
        actual: null,
        previous: null,
        category,
        createdAt: new Date().toISOString(),
        analyses: []
      };

      setEvents([mockNewEvent, ...events]);
      setTitle("");
      setTime("");
      setForecast("");
      setFormLoading(false);
      toast.success("Haber kaydı eklendi. Yapay zeka analizi tetiklendi!");
    }, 1200);
  };

  const handleRefetchAnalysis = async (eventId: string) => {
    setRefetchLoading(eventId);
    const token = localStorage.getItem("access_token");
    try {
      // Direct call to analysis engine endpoint to trigger Claude recheck
      const res = await fetch(`/api/news/${eventId}/analysis`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      toast.success("AI Analizi başarıyla güncellendi.");
    } catch {
      toast.error("AI Analiz yenileme başarısız.");
    } finally {
      setRefetchLoading(null);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6 select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Haber ve Analiz Yönetimi</h1>
        <p className="text-xs text-text-muted mt-1">Platformdaki ekonomik takvim verilerini ve Claude analiz motorunu yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form: Add manual news */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5 border-b border-border/30 pb-2">
            <Plus className="h-4 w-4" />
            Manuel Haber Ekle
          </h3>

          <form onSubmit={handleCreateEvent} className="flex flex-col gap-3.5">
            <Input label="Haber Başlığı" placeholder="Örn: Fed Faiz Kararı (FOMC)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Para Birimi" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              <Input label="Önem (LOW/MEDIUM/HIGH)" value={impact} onChange={(e) => setImpact(e.target.value.toUpperCase())} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Açıklanma Zamanı" placeholder="Örn: 21:00" value={time} onChange={(e) => setTime(e.target.value)} />
              <Input label="Beklenti (Forecast)" placeholder="Örn: 5.25%" value={forecast} onChange={(e) => setForecast(e.target.value)} />
            </div>
            <Input label="Kategori" value={category} onChange={(e) => setCategory(e.target.value)} />

            <Button type="submit" loading={formLoading} className="w-full mt-2 h-10 text-xs font-bold">
              Kaydet ve Analiz Et
            </Button>
          </form>
        </Card>

        {/* Table: News list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Son Eklenen Haberler</h3>
          
          <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Haber</th>
                  <th className="p-3">Impact</th>
                  <th className="p-3">Saat</th>
                  <th className="p-3">Analiz Durumu</th>
                  <th className="p-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-text-muted/50">Yükleniyor...</td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-text-muted/50">Haber bulunmuyor.</td>
                  </tr>
                ) : (
                  events.map((ev) => {
                    const hasAnalysis = ev.analyses && ev.analyses.length > 0;
                    return (
                      <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-background-secondary/10">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-semibold">{ev.titleEn}</span>
                            <span className="text-[10px] text-text-muted font-mono">{ev.currency}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={ev.impact.toLowerCase() as any}>{ev.impact}</Badge>
                        </td>
                        <td className="p-3 text-text-muted font-mono">{ev.eventTime}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            hasAnalysis ? "text-green" : "text-text-muted/60"
                          }`}>
                            <Cpu className="h-3 w-3" />
                            {hasAnalysis ? "HAZIR" : "MOCK/YOK"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={refetchLoading === ev.id}
                            onClick={() => handleRefetchAnalysis(ev.id)}
                            className="text-[10px] h-8 px-2.5 flex items-center gap-1.5 ml-auto"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Analizi Yenile</span>
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
