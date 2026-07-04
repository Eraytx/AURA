"use client";

import { useTranslation } from "../../../components/LocaleProvider";

export default function TermsPage() {
  const { locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary py-20 px-6 font-sans select-none">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Kullanım Koşulları (Terms of Service)</h1>
        <p className="text-xs text-text-muted">Son Güncelleme: 3 Temmuz 2026</p>

        {locale === "tr" ? (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-text-primary/95">
            <p>
              AURA XAUUSD portalına erişerek bu koşulları kabul etmiş sayılırsınız.
            </p>
            <h2 className="text-sm font-bold text-gold mt-2">1. Yatırım Tavsiyesi Değildir</h2>
            <p>
              Platformumuzda sunulan yapay zeka haber analizleri, tarihsel tepki grafikleri ve sapma simülatörleri tamamen eğitim ve genel bilgilendirme amaçlıdır. Hiçbir içerik yatırım tavsiyesi (financial advice) kapsamında değerlendirilemez.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-text-primary/95">
            <p>
              By accessing the AURA XAUUSD portal, you agree to comply with these terms of service.
            </p>
            <h2 className="text-sm font-bold text-gold mt-2">1. No Financial Advice</h2>
            <p>
              All AI-driven analysis, deviation simulations, and historical reaction metrics are provided for educational and information purposes only. None of the content should be treated as financial advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
