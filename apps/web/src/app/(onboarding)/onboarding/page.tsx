"use client";

import { useState } from "react";
import { Card, Button, Input, toast } from "@aura/ui";
import { useRouter } from "next/navigation";
import { Check, Bell, Shield, ThumbsUp, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

const INTERESTS_LIST = ["CPI", "NFP", "FOMC", "GDP", "PMI", "Retail Sales", "PPI", "JOLTS"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  // Step 2 Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 3 Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [beforeAlerts, setBeforeAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleBrowserNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Bildirim izni onaylandı!");
        } else {
          toast.warning("Bildirim izni reddedildi.");
        }
      });
    }
  };

  const handleCompleteOnboarding = async (planSelection: "FREE" | "PREMIUM") => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      // Save interests, notifications, and onboarding completed flags to profile API
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name || undefined,
          hasCompletedOnboarding: true,
          preferences: {
            interests: selectedInterests,
            notifications: { emailAlerts, beforeAlerts, weeklyDigest }
          }
        })
      });

      if (!res.ok) throw new Error();

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success("Kurulum tamamlandı! AURA portalına hoş geldiniz.");

      if (planSelection === "PREMIUM") {
        router.push("/pricing");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Kurulum kaydedilirken hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center p-6 font-sans select-none">
      <Card className="w-full max-w-lg p-8 bg-background-card border-border/40 flex flex-col justify-between min-h-[460px]">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider mb-6">
          <span>AURA ONBOARDING</span>
          <span>ADIM {step} / 4</span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="flex-grow flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">AURA XAUUSD'ye Hoş Geldiniz! 👋</h1>
              <p className="text-xs text-text-muted leading-relaxed">
                Altın fiyat hareketlerini AI analizleri ve geçmiş takvim sapmaları ile yönetmek için profilinizi hızlıca hazırlayalım.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Input
                label="Adınız Soyadınız"
                placeholder="Örn: Ali Yılmaz"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button onClick={() => setStep(2)} className="h-10 text-xs mt-4 flex items-center justify-center gap-1">
              <span>Hadi Başlayalım</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="flex-grow flex flex-col justify-center gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">Hangi Haberleri Takip Etmek İstersiniz?</h2>
              <p className="text-xs text-text-muted">Seçtiğiniz haberler takvim ekranında öncelikli olarak filtrelenecektir.</p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {INTERESTS_LIST.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? "border-gold text-gold bg-gold/5 shadow-[0_0_10px_rgba(212,160,23,0.02)]"
                        : "border-border bg-background-primary text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            <Button onClick={() => setStep(3)} className="h-10 text-xs mt-4">
              İlerle
            </Button>
          </div>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <div className="flex-grow flex flex-col justify-center gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">Bildirim Ayarları</h2>
              <p className="text-xs text-text-muted">Kritik haberlerin açıklanma anlarındaki volatiliteden anında haberdar olun.</p>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="rounded border-border text-gold bg-background-primary focus:ring-gold"
                />
                <div className="flex flex-col">
                  <span className="font-bold">E-posta Alerleri</span>
                  <span className="text-[10px] text-text-muted">HIGH impact USD haberleri sonrası anlık mail.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={beforeAlerts}
                  onChange={() => setBeforeAlerts(!beforeAlerts)}
                  className="rounded border-border text-gold bg-background-primary focus:ring-gold"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Haber Öncesi Uyarılar</span>
                  <span className="text-[10px] text-text-muted">Haber açıklanmadan 15 dk önce hatırlatıcı mail.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={() => setWeeklyDigest(!weeklyDigest)}
                  className="rounded border-border text-gold bg-background-primary focus:ring-gold"
                />
                <div className="flex flex-col">
                  <span className="font-bold">Haftalık Bülten</span>
                  <span className="text-[10px] text-text-muted">Haftalık XAUUSD performansı ve haber özet digest.</span>
                </div>
              </label>

              <Button
                type="button"
                variant="secondary"
                onClick={handleBrowserNotificationPermission}
                className="h-10 mt-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Bell className="h-4 w-4 text-gold" />
                <span>Tarayıcı Bildirim İzni İste</span>
              </Button>
            </div>

            <Button onClick={() => setStep(4)} className="h-10 text-xs mt-2">
              Son Adıma Geç
            </Button>
          </div>
        )}

        {/* Step 4: Plan Selection */}
        {step === 4 && (
          <div className="flex-grow flex flex-col justify-center gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-lg font-bold">Harika! Son Adım: Planınızı Seçin</h2>
              <p className="text-xs text-text-muted">Aboneliğinizi dilediğiniz an iptal edebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Free Plan card */}
              <Card className="p-4 bg-background-primary border-border/40 flex flex-col justify-between min-h-[160px] text-center">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase">Ücretsiz Plan</span>
                  <div className="text-lg font-bold text-text-primary mt-1">$0/ay</div>
                  <p className="text-[9px] text-text-muted mt-2">Temel haber izleme ve 5 haber/gün limiti.</p>
                </div>
                <Button variant="secondary" onClick={() => handleCompleteOnboarding("FREE")} className="w-full text-[10px] h-8 mt-4">
                  Free ile Başla
                </Button>
              </Card>

              {/* Premium Plan card */}
              <Card className="p-4 bg-background-secondary/30 border-2 border-gold flex flex-col justify-between min-h-[160px] text-center relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-gold text-background-primary text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl">
                  Önerilen
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase">Premium Plan</span>
                  <div className="text-lg font-bold text-text-primary mt-1">$9.99/ay</div>
                  <p className="text-[9px] text-text-muted mt-2">AI simülatörü, geçmiş analizler ve API erişimi.</p>
                </div>
                <Button onClick={() => handleCompleteOnboarding("PREMIUM")} className="w-full text-[10px] h-8 mt-4 bg-gold text-[#0D0D0D]">
                  Premium Ol
                </Button>
              </Card>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
