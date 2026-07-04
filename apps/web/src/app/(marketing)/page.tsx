"use client";

import { useTranslation } from "../../components/LocaleProvider";
import { Button, Card } from "@aura/ui";
import { ArrowRight, Star, Cpu, Calendar, TrendingUp, Sliders, Shield, Play } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary font-sans select-none overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center gap-6">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] font-bold uppercase tracking-wider animate-pulse">
          <Star className="h-3.5 w-3.5 fill-gold" />
          <span>Yapay Zeka Destekli XAUUSD Yatırım Portalı</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl">
          Altın Piyasasını <span className="text-gold">Profesyoneller Gibi</span> Takip Edin
        </h1>
        <p className="text-sm text-text-muted max-w-xl leading-relaxed">
          XAUUSD paritesini etkileyen forex haberlerini gerçek zamanlı takip edin. AI destekli analiz, tarihsel reaksiyonlar ve anlık beklenti sapma simülatörü.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
          <Link href="/register">
            <Button className="h-11 px-8 text-xs font-bold w-full sm:w-auto bg-gold text-[#0D0D0D]">
              Ücretsiz Başla
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" className="h-11 px-8 text-xs font-bold w-full sm:w-auto flex items-center justify-center gap-1.5 border-border/80 hover:border-gold/30">
              <Play className="h-3.5 w-3.5 fill-text-primary" />
              <span>Demoyu İncele</span>
            </Button>
          </Link>
        </div>

        {/* Hero image preview */}
        <div className="w-full mt-10 rounded-xl overflow-hidden border border-border/40 bg-background-card p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background-primary/80 to-transparent pointer-events-none" />
          <div className="aspect-[16/9] w-full bg-black/40 flex items-center justify-center text-text-muted/40 font-mono text-xs border border-border/20 rounded-lg">
            AURA XAUUSD Portal Arayüz Önizlemesi
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF */}
      <section className="py-12 border-t border-b border-border/30 bg-background-secondary/35 text-center">
        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-6">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            XAUUSD YATIRIMCILARININ YORUMLARI
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Card className="p-5 bg-background-card/50 border-border/40 flex flex-col justify-between">
              <p className="text-xs text-text-muted italic leading-relaxed">
                "NFP açıklamalarında altın fiyatının hangi yöne gideceğini tahmin etmek artık piyango değil. AURA'nın AI analizleri harika çalışıyor."
              </p>
              <div className="text-[10px] font-bold text-gold mt-4 font-mono">Ali K. — Pro Trader</div>
            </Card>
            <Card className="p-5 bg-background-card/50 border-border/40 flex flex-col justify-between">
              <p className="text-xs text-text-muted italic leading-relaxed">
                "Tepki grafiklerindeki 120 saniyelik ons altın fiyat geçmişi reaksiyonu gerçekten benzersiz bir veri. Başarılar dilerim."
              </p>
              <div className="text-[10px] font-bold text-gold mt-4 font-mono">Marta S. — Portfolio Manager</div>
            </Card>
            <Card className="p-5 bg-background-card/50 border-border/40 flex flex-col justify-between">
              <p className="text-xs text-text-muted italic leading-relaxed">
                "Haber etki simülatörünü kullanarak olası faiz oran sapmalarının altına yapacağı etkiyi simüle ediyorum, sonuçlar çok tutarlı."
              </p>
              <div className="text-[10px] font-bold text-gold mt-4 font-mono">Can Y. — Algorithmic Trader</div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-2">
          <span className="text-xs font-bold text-gold uppercase tracking-wider">NEDEN AURA?</span>
          <h2 className="text-2xl font-bold">Trading Stratejinizi Destekleyen Güçlü Araçlar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-3">
            <Calendar className="h-8 w-8 text-gold" />
            <h3 className="text-sm font-bold">1. Gerçek Zamanlı Haberler</h3>
            <p className="text-xs text-text-muted leading-relaxed">Forex takvim verilerini anlık gecikmesiz olarak takip edin.</p>
          </Card>

          <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-3">
            <Cpu className="h-8 w-8 text-gold" />
            <h3 className="text-sm font-bold">2. AI Analiz Motoru</h3>
            <p className="text-xs text-text-muted leading-relaxed">Claude entegrasyonu ile haberlerin olası etkilerini anında görün.</p>
          </Card>

          <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-3">
            <TrendingUp className="h-8 w-8 text-gold" />
            <h3 className="text-sm font-bold">3. Reaksiyon Grafikleri</h3>
            <p className="text-xs text-text-muted leading-relaxed">Haber açıklanma anında altın ons fiyatındaki milisaniyelik hareket geçmişi.</p>
          </Card>

          <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-3">
            <Sliders className="h-8 w-8 text-gold" />
            <h3 className="text-sm font-bold">4. Etki Simülatörü</h3>
            <p className="text-xs text-text-muted leading-relaxed">Gerçekleşen değer sapmalarına göre altın fiyat hareketini simüle edin.</p>
          </Card>

          <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-3">
            <Shield className="h-8 w-8 text-gold" />
            <h3 className="text-sm font-bold">5. Tarihsel Veriler</h3>
            <p className="text-xs text-text-muted leading-relaxed">Geçmiş benzer ekonomik haberlerde altının tepki şablonlarını inceleyin.</p>
          </Card>

          <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-3">
            <Star className="h-8 w-8 text-gold" />
            <h3 className="text-sm font-bold">6. Anlık Bildirimler</h3>
            <p className="text-xs text-text-muted leading-relaxed">SSE akışı sayesinde veri açıklandığı an tarayıcınızda ve mailinizde.</p>
          </Card>
        </div>
      </section>

      {/* 4. WORKFLOW */}
      <section className="py-20 bg-background-secondary/20 border-t border-border/25">
        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-10">
          <div className="text-center flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gold uppercase">BASİT VE ETKİLİ</span>
            <h2 className="text-xl font-bold">Nasıl Çalışır?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold font-mono text-sm border border-gold/30">
                1
              </div>
              <h4 className="text-xs font-bold">Haberi Seçin</h4>
              <p className="text-[11px] text-text-muted">Ekonomik takvimden ilgilendiğiniz haber detayını açın.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold font-mono text-sm border border-gold/30">
                2
              </div>
              <h4 className="text-xs font-bold">AI Analizini İnceleyin</h4>
              <p className="text-[11px] text-text-muted">Yapay zekanın beklentileri ve geçmiş reaksiyonları süzün.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold font-mono text-sm border border-gold/30">
                3
              </div>
              <h4 className="text-xs font-bold">Kararınızı Verin</h4>
              <p className="text-[11px] text-text-muted">Simülatör sapmalarıyla altın fiyatlarındaki etkiyi test edin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-border/30 bg-background-secondary py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 text-xs text-text-muted">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/20 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gold font-mono">Au</span>
              <span className="font-bold text-text-primary text-sm">AURA XAUUSD</span>
            </div>
            <div className="flex gap-4">
              <Link href="/pricing" className="hover:text-text-primary transition-all">Fiyatlandırma</Link>
              <Link href="/blog" className="hover:text-text-primary transition-all">Blog</Link>
              <Link href="/privacy" className="hover:text-text-primary transition-all">Gizlilik</Link>
              <Link href="/terms" className="hover:text-text-primary transition-all">Kullanım Koşulları</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p>© 2026 AURA XAUUSD. Tüm hakları saklıdır.</p>
            <p className="text-[10px] text-text-muted/65 leading-relaxed">
              Risk Uyarısı: Altın ve döviz (forex) gibi kaldıraçlı varlık trading işlemleri yüksek oranda risk içerir ve her yatırımcı için uygun olmayabilir. Sistemimiz tamamen bilgilendirme amaçlı olup yatırım kararlarınızdan sorumlu tutulamaz.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
