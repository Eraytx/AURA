"use client";

import { useEffect, useState } from "react";
import { Card, Button, toast } from "@aura/ui";
import { Share2, Gift, Users, Copy, Check, Heart } from "lucide-react";

export default function ReferralPage() {
  const [refCode, setRefCode] = useState<string>("AURA-LOADING");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalInvited: 3,
    premiumUpgraded: 1,
    rewardsDays: 7,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const u = data.user;
        if (u) {
          // If no referralCode was set yet, generate mock or query from user
          setRefCode(u.referralCode || `AURA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral bağlantısı kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-8 bg-background-primary h-full overflow-y-auto select-none font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Gift className="h-5 w-5 text-gold" />
            Arkadaş Davet Programı (Referral)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Arkadaşlarınızı AURA'ya davet edin, premium üyeliklerinizi birlikte uzatın.
          </p>
        </div>

        {/* Big Referral code card */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Sizin Referral Kodunuz</span>
            <div className="text-2xl font-black font-mono tracking-widest text-text-primary select-all">
              {refCode}
            </div>
            <p className="text-xs text-text-muted max-w-sm">
              Bu kodu veya aşağıdaki özel davet bağlantısını arkadaşlarınızla paylaşın.
            </p>
          </div>

          <Button onClick={handleCopyLink} className="h-11 px-6 text-xs flex items-center gap-1.5 shrink-0 bg-gold text-[#0D0D0D]">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Bağlantı Kopyalandı!" : "Davet Linkini Kopyala"}</span>
          </Button>
        </Card>

        {/* Invitation stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-muted uppercase">Toplam Davet Edilen</span>
              <span className="text-2xl font-bold text-text-primary">{stats.totalInvited} kişi</span>
            </div>
            <Users className="h-8 w-8 text-gold/30" />
          </Card>

          <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-muted uppercase">Premium Geçiş Yapan</span>
              <span className="text-2xl font-bold text-green">{stats.premiumUpgraded} kişi</span>
            </div>
            <Gift className="h-8 w-8 text-green/45" />
          </Card>

          <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-text-muted uppercase">Kazanılan Bedava Gün</span>
              <span className="text-2xl font-bold text-text-primary">+{stats.rewardsDays} Gün</span>
            </div>
            <Heart className="h-8 w-8 text-gold/30" />
          </Card>
        </div>

        {/* Benefits Explanations */}
        <Card className="p-6 bg-background-card border-border/40 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border/30 pb-2">
            Nasıl Çalışır & Ödüller Nedir?
          </h3>
          
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                1
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Bağlantınızı Paylaşın</span>
                <span className="text-[10px] text-text-muted leading-relaxed">Özel davet bağlantınızı sosyal medyada veya doğrudan arkadaşlarınızla paylaşın.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                2
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Arkadaşınız Premium Üye Olsun</span>
                <span className="text-[10px] text-text-muted leading-relaxed">Bağlantınızla üye olan kullanıcı ilk ay ödemesinde otomatik olarak %20 indirim kuponu kazanır.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                3
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Ödülleri Toplayın!</span>
                <span className="text-[10px] text-text-muted leading-relaxed">Arkadaşınız premium üyeliğe geçtiğinde hesabınıza anında +7 gün ücretsiz Premium abonelik uzatması eklenir.</span>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
