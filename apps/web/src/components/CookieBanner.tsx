"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@aura/ui";
import { Info, Settings } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Consent states
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        setVisible(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = { essential: true, analytics: true, marketing: true };
    localStorage.setItem("cookie_consent", JSON.stringify(preferences));
    setVisible(false);
    toast.success("Çerez tercihleriniz kaydedildi.");
  };

  const handleSaveCustom = () => {
    const preferences = { essential: true, analytics, marketing };
    localStorage.setItem("cookie_consent", JSON.stringify(preferences));
    setVisible(false);
    setShowSettings(false);
    toast.success("Özelleştirilmiş çerez tercihleriniz kaydedildi.");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 font-sans select-none animate-in slide-in-from-bottom-5 duration-300">
      <Card className="max-w-4xl mx-auto p-5 bg-background-card/95 border-gold/30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex-1 flex gap-3">
          <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary">Çerez Tercihleri ve GDPR Aydınlatma Metni</span>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed max-w-2xl">
              Deneyiminizi geliştirmek ve istatistik analizi yapabilmek adına çerezler kullanmaktayız. Kabul etmeniz halinde Google Analytics 4 kodları aktif edilecektir. Detaylar için <a href="/privacy" className="text-gold underline">Gizlilik Politikamızı</a> inceleyin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <Button variant="secondary" onClick={() => setShowSettings(!showSettings)} className="text-[10px] h-9 px-3 flex items-center gap-1">
            <Settings className="h-3.5 w-3.5" />
            <span>Ayarlar</span>
          </Button>
          <Button onClick={handleAcceptAll} className="text-[10px] h-9 px-4 bg-gold text-[#0D0D0D]">
            Tümünü Kabul Et
          </Button>
        </div>

      </Card>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-border bg-background-card rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Çerez Özelleştirme Ayarları</h3>
            
            <div className="flex flex-col gap-4 py-2">
              <label className="flex items-center justify-between text-xs cursor-not-allowed">
                <div className="flex flex-col">
                  <span className="font-bold">Zorunlu Çerezler</span>
                  <span className="text-[9px] text-text-muted">Oturum yönetimi ve temel güvenlik işlevleri.</span>
                </div>
                <input type="checkbox" checked disabled className="rounded border-border text-gold bg-background-primary opacity-60" />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold">Analitik Çerezler (GA4)</span>
                  <span className="text-[9px] text-text-muted">Sayfa görüntüleme ve kullanıcı deneyim analizleri.</span>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={() => setAnalytics(!analytics)}
                  className="rounded border-border text-gold bg-background-primary focus:ring-gold"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold">Pazarlama Çerezleri</span>
                  <span className="text-[9px] text-text-muted">Reklam dönütleri ve dönüşüm takipleri.</span>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={() => setMarketing(!marketing)}
                  className="rounded border-border text-gold bg-background-primary focus:ring-gold"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/30">
              <Button variant="secondary" onClick={() => setShowSettings(false)} size="sm">İptal</Button>
              <Button onClick={handleSaveCustom} size="sm">Tercihleri Kaydet</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Global Toast injection proxy for simpler triggers
const toast = {
  success: (msg: string) => console.log(`[COOKIE TOAST SUCCESS] ${msg}`),
  warning: (msg: string) => console.warn(`[COOKIE TOAST WARN] ${msg}`),
};
