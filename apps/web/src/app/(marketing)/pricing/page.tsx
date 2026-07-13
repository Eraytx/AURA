"use client";

import { useState } from "react";
import { Card, Button, toast } from "@aura/ui";
import { Check, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const FAQS = [
  {
    q: "Aboneliği iptal etmek ne kadar sürer?",
    a: "İptal işlemi saniyeler sürer. Dashboard üzerindeki abonelik sayfanızdan veya fatura yönetim portalından tek tıkla iptal edebilirsiniz. İptal sonrasında dönem sonuna kadar erişiminiz devam eder."
  },
  {
    q: "Verilerimi ve kart bilgilerimi güvende tutuyor musunuz?",
    a: "Evet. Kart ve ödeme altyapımız tamamen endüstri standardı olan Stripe tarafından PCI-DSS uyumlu sunucularda işlenir. Sunucularımızda hiçbir şekilde kart verisi saklanmaz."
  },
  {
    q: "Premium API erişimi nedir?",
    a: "Premium üyelerimiz kendilerine özel üretilen API anahtarları ile haber verilerini ve yapay zeka analizlerini programatik olarak çekebilir. Günlük limit 1000 istek/gündür."
  },
  {
    q: "Yıllık plana sonradan geçiş yapabilir miyim?",
    a: "Tabii ki. Aylık aboneliğiniz devam ederken dilediğiniz an yıllık plana geçerek %33 tasarruf edebilirsiniz. Kalan süreniz otomatik olarak mahsup edilir."
  },
  {
    q: "30 günlük iade politikası nasıl çalışır?",
    a: "Aboneliğinizin ilk 30 günü içerisinde platformdan memnun kalmazsanız destek ekibimize bildirebilir ve hiçbir soru sorulmaksızın ücret iadesi alabilirsiniz."
  },
  {
    q: "Her ödeme için fatura kesiliyor mu?",
    a: "Evet. Her ödemeniz sonrasında faturanız otomatik olarak kesilir ve PDF formatında hesabınıza yüklenir. Dilediğiniz zaman dashboard üzerinden faturalarınızı indirebilirsiniz."
  }
];

export default function PricingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "tr";
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = async (plan: "MONTHLY" | "YEARLY") => {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        toast.warning("Lütfen abonelik satın almadan önce giriş yapın.");
        router.push(`/${locale}/login?redirect=/${locale}/pricing`);
        return;
      }

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.message || "Bilinmeyen hata");

      if (d.url) {
        window.location.href = d.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Ödeme oturumu başlatılamadı.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary py-20 px-6 font-sans select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        
        {/* Title and Headers */}
        <div className="text-center flex flex-col gap-4">
          <span className="text-xs uppercase font-bold tracking-widest text-gold">Fiyatlandırma</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Profesyonel Altın Analizi</h1>
          <p className="text-sm text-text-muted max-w-lg mx-auto">
            Haber açıklamalarında oluşan anlık XAUUSD fiyat sapmalarını yapay zeka ve tarihsel analiz motoruyla yönetin.
          </p>

          {/* Toggle button Monthly/Yearly */}
          <div className="flex items-center justify-center gap-3.5 mt-6">
            <span className={`text-xs font-semibold ${!isYearly ? "text-gold" : "text-text-muted"}`}>Aylık Faturalandırma</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 rounded-full bg-background-secondary border border-border p-1 flex items-center transition-all relative"
            >
              <div className={`h-4 w-4 rounded-full bg-gold transition-all ${isYearly ? "translate-x-6" : ""}`} />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isYearly ? "text-gold" : "text-text-muted"}`}>
              Yıllık Faturalandırma
              <span className="bg-gold/15 text-gold text-[9px] font-bold px-2 py-0.5 rounded-full border border-gold/20">
                %33 Tasarruf
              </span>
            </span>
          </div>
        </div>

        {/* 2 pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* FREE CARD */}
          <Card className="flex flex-col justify-between p-8 bg-background-card border-border/40 min-h-[480px]">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary">FREE</h3>
                <p className="text-xs text-text-muted mt-1">Temel izleme özellikleri</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-text-muted">/ sonsuza kadar</span>
              </div>

              <ul className="flex flex-col gap-3 text-xs text-text-muted pt-4 border-t border-border/40">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Bugünün haberleri (günde max 5 adet)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Temel AI analiz özeti</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Reklamlı web deneyimi</span>
                </li>
              </ul>
            </div>

            <Button variant="secondary" onClick={() => router.push("/register")} className="w-full mt-8 h-11 text-xs font-bold">
              Ücretsiz Başla
            </Button>
          </Card>

          {/* PREMIUM CARD */}
          <Card className="flex flex-col justify-between p-8 bg-background-card border-2 border-gold shadow-[0_0_30px_rgba(212,160,23,0.06)] relative overflow-hidden min-h-[480px]">
            <div className="absolute right-0 top-0 bg-gold text-background-primary text-[9px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-bl-lg font-mono">
              En Popüler
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-gold">PREMIUM</h3>
                <p className="text-xs text-text-muted mt-1">Profesyonel veri ve simülatör paketi</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">${isYearly ? "79.99" : "9.99"}</span>
                <span className="text-xs text-text-muted">/ {isYearly ? "yıl" : "ay"}</span>
              </div>

              <ul className="flex flex-col gap-3 text-xs text-text-primary pt-4 border-t border-border/40">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Tüm haberler + 90 günlük geçmiş veri akışı</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Tam AI analiz + anlık etki simülatörü</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>İnce zaman dilimli grafik detayları</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Detaylı haber reaksiyon verisi CSV export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Anlık yüksek etkili (HIGH) haber bildirim mailleri</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>API erişimi (1000 istek/gün limitli)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-gold" />
                  <span>Reklamsız ve öncelikli destek</span>
                </li>
              </ul>
            </div>

            <Button
              loading={loading}
              onClick={() => handleSubscribe(isYearly ? "YEARLY" : "MONTHLY")}
              className="w-full mt-8 h-11 text-xs font-bold bg-gold hover:bg-gold-light text-background-primary"
            >
              Premium Ol
            </Button>
          </Card>

        </div>

        {/* 30 day Money back guarantee card */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-background-card/50 border border-border/40 p-6 rounded-xl">
          <ShieldCheck className="h-10 w-10 text-gold shrink-0" />
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-sm font-bold">30 Günlük Memnuniyet Garantisi</h4>
            <p className="text-xs text-text-muted mt-1">
              Hizmetimizden memnun kalmazsanız ilk 30 gün içinde iade talep edebilirsiniz. Ödemenizin tamamı kesintisiz olarak iade edilecektir.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-gold" />
            Sıkça Sorulan Sorular
          </h2>

          <div className="flex flex-col border border-border/40 rounded-xl divide-y divide-border/40 overflow-hidden bg-background-card/25">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="flex flex-col">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex justify-between items-center p-4 text-left font-medium text-xs hover:bg-background-secondary/20 transition-all focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className="text-gold text-lg font-bold">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-text-muted leading-relaxed animate-in fade-in-20 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
