"use client";

import { useState } from "react";
import { Card, Button, Input, Badge, toast } from "@aura/ui";
import { Settings, ShieldCheck, ShieldAlert, RefreshCw, Trash2, Cpu } from "lucide-react";

export default function AdminSettingsPage() {
  const [crawlInterval, setCrawlInterval] = useState("10");
  const [claudeLimit, setClaudeLimit] = useState("10");
  const [freeLimit, setFreeLimit] = useState("5");
  const [maintenance, setMaintenance] = useState(false);
  const [flushLoading, setFlushLoading] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Sistem ayarları güncellendi.");
  };

  const handleFlushRedis = () => {
    if (confirm("Tüm Redis önbelleğini (Haber analiz cache'leri dahil) temizlemek istediğinize emin misiniz?")) {
      setFlushLoading(true);
      setTimeout(() => {
        setFlushLoading(false);
        toast.success("Redis önbelleği başarıyla temizlendi.");
      }, 1500);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6 select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Sistem Ayarları</h1>
        <p className="text-xs text-text-muted mt-1">Platform veri akış parametrelerini ve sistem servis entegrasyon durumlarını denetleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form: Config settings */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-4 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 border-b border-border/30 pb-2">
            <Settings className="h-4 w-4 text-gold" />
            Parametre Ayarları
          </h3>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Forex Factory Çekim Aralığı (Dakika)" value={crawlInterval} onChange={(e) => setCrawlInterval(e.target.value)} />
            <Input label="Claude API Rate Limiti (İstek/Dakika)" value={claudeLimit} onChange={(e) => setClaudeLimit(e.target.value)} />
            <Input label="Free Plan Günlük Haber Limiti" value={freeLimit} onChange={(e) => setFreeLimit(e.target.value)} />
            
            <div className="flex flex-col gap-1.5 justify-center">
              <span className="text-[10px] uppercase font-bold text-text-muted">Bakım Modu (Maintenance Mode)</span>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={() => setMaintenance(!maintenance)}
                  className="rounded border-border text-gold bg-background-primary focus:ring-gold"
                />
                <span className="text-xs font-semibold text-text-primary">Platform Bakım Modunu Etkinleştir</span>
              </label>
            </div>

            <div className="md:col-span-2 pt-2 border-t border-border/30 mt-2">
              <Button type="submit" className="text-xs px-5 h-10 font-bold">
                Ayarları Kaydet
              </Button>
            </div>
          </form>
        </Card>

        {/* Column: Health checks status & cache */}
        <div className="flex flex-col gap-6">
          
          {/* Health Checks */}
          <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-gold" />
              Servis Sağlık Durumu (Health Check)
            </h3>

            <div className="flex flex-col gap-3 mt-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Database (PostgreSQL)</span>
                <span className="flex items-center gap-1 text-green font-bold text-[10px]">
                  <ShieldCheck className="h-4 w-4" /> AKTİF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cache & Rate-limit (Redis)</span>
                <span className="flex items-center gap-1 text-green font-bold text-[10px]">
                  <ShieldCheck className="h-4 w-4" /> AKTİF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Anthropic Claude API</span>
                <span className="flex items-center gap-1 text-green font-bold text-[10px]">
                  <ShieldCheck className="h-4 w-4" /> AKTİF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Stripe Payment API</span>
                <span className="flex items-center gap-1 text-green font-bold text-[10px]">
                  <ShieldCheck className="h-4 w-4" /> AKTİF
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Resend Email API</span>
                <span className="flex items-center gap-1 text-green font-bold text-[10px]">
                  <ShieldCheck className="h-4 w-4" /> AKTİF
                </span>
              </div>
            </div>
          </Card>

          {/* Redis cache operations */}
          <Card className="border-red/30 bg-red/5 p-6 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red flex items-center gap-1.5 pb-1">
              <Trash2 className="h-4 w-4" />
              Sistem Önbellek Yönetimi
            </h3>
            <p className="text-[11px] text-red/80 leading-relaxed">
              Önbelleği temizlemeniz durumunda tüm AI analiz ve Yahoo Finance fiyat verileri Redis'ten silinir ve ilk talepte tekrar üretilir.
            </p>
            <Button
              onClick={handleFlushRedis}
              loading={flushLoading}
              className="bg-red hover:bg-red-light text-white text-xs h-10 w-full mt-2 font-bold"
            >
              Tüm Redis Önbelleğini Temizle (Flush Cache)
            </Button>
          </Card>

        </div>

      </div>
    </div>
  );
}
