"use client";

import { useTranslation } from "../../../components/LocaleProvider";

export default function PrivacyPage() {
  const { locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary py-20 px-6 font-sans select-none">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Gizlilik Politikası (Privacy Policy)</h1>
        <p className="text-xs text-text-muted">Son Güncelleme: 3 Temmuz 2026</p>

        {locale === "tr" ? (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-text-primary/95">
            <p>
              AURA XAUUSD olarak gizliliğinize büyük önem veriyoruz. Bu metin, platformumuzu kullandığınızda verilerinizin nasıl toplandığını ve işlendiğini açıklar.
            </p>
            <h2 className="text-sm font-bold text-gold mt-2">1. Toplanan Veriler</h2>
            <p>
              Üyelik kaydı sırasında e-posta adresiniz, isminiz ve Stripe ödeme alt yapısı için gerekli fatura detaylarınız güvenli şekilde şifrelenerek veritabanımızda saklanır.
            </p>
            <h2 className="text-sm font-bold text-gold mt-2">2. Çerez Kullanımı (GDPR / KVKK)</h2>
            <p>
              Kullanıcı çerez tercihleri doğrultusunda analiz verileri (Google Analytics 4) toplanmaktadır. Tercihlerinizi dilediğiniz an çerez yönetim modalından düzenleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-text-primary/95">
            <p>
              At AURA XAUUSD, we respect your privacy. This policy explains how we collect and process your information when you use our platform.
            </p>
            <h2 className="text-sm font-bold text-gold mt-2">1. Data Collection</h2>
            <p>
              During registration, your email address, name, and billing details required by Stripe billing integrations are stored securely.
            </p>
            <h2 className="text-sm font-bold text-gold mt-2">2. Cookie Policy (GDPR)</h2>
            <p>
              Google Analytics 4 details are tracked only upon explicit user acceptance in our GDPR cookie banner settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
