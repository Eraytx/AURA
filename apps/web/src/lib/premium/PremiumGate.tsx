"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@aura/ui";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export const PREMIUM_FEATURES = {
  history: "Geçmiş haberler",
  simulator: "Haber etki simülatörü",
  chartDetails: "Grafik detayları",
  csvExport: "CSV dışa aktarma",
  emailAlerts: "Email bildirimleri",
  apiAccess: "API erişimi",
  adFree: "Reklamsız deneyim",
  comparison: "Haber karşılaştırması",
  replayMode: "Haber replay modu",
} as const;

export type PremiumFeature = keyof typeof PREMIUM_FEATURES;

interface PremiumContextType {
  isPremium: boolean;
  isAdmin: boolean;
  plan: "FREE" | "MONTHLY" | "YEARLY";
  expiresAt: string | null;
  daysLeft: number;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isAdmin: false,
  plan: "FREE",
  expiresAt: null,
  daysLeft: 0,
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<PremiumContextType>({
    isPremium: false,
    isAdmin: false,
    plan: "FREE",
    expiresAt: null,
    daysLeft: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => {
        const u = d.user;
        if (u) {
          const isPremiumUser = u.role === "PREMIUM" || u.role === "ADMIN" || u.plan !== "FREE";
          const isAdminUser = u.role === "ADMIN";
          
          let daysLeft = 0;
          if (u.planExpiresAt) {
            const diffTime = new Date(u.planExpiresAt).getTime() - Date.now();
            daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }

          setValue({
            isPremium: isPremiumUser,
            isAdmin: isAdminUser,
            plan: u.plan,
            expiresAt: u.planExpiresAt,
            daysLeft,
          });
        }
      })
      .catch(() => {});
  }, []);

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  return useContext(PremiumContext);
}

export function LockedOverlay() {
  const router = useRouter();

  return (
    <div className="absolute inset-0 bg-background-primary/70 backdrop-blur-md z-30 flex flex-col items-center justify-center border border-border/40 rounded-xl p-6 text-center select-none animate-in fade-in-50 duration-200">
      <div className="p-3.5 bg-gold/10 border border-gold/30 rounded-full text-gold mb-4 scale-105 transition-transform hover:scale-110">
        <Lock className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-bold text-text-primary mb-1">Premium Üyelik Gerekli</h4>
      <p className="text-xs text-text-muted max-w-[280px] mb-5 leading-relaxed">
        Bu özellik Premium abonelerimize özeldir. AI simülatörü, geçmiş analizler ve API erişimini hemen açın.
      </p>
      <Button
        onClick={() => router.push("/pricing")}
        className="px-6 py-2 h-10 text-xs font-bold shadow-lg shadow-gold/10 transition-all hover:shadow-gold/20"
      >
        Premium Ol — $9.99/ay
      </Button>
    </div>
  );
}

interface PremiumGateProps {
  feature: PremiumFeature;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PremiumGate({ feature, fallback, children }: PremiumGateProps) {
  const { isPremium } = usePremium();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative h-full w-full min-h-[150px]">
      <div className="pointer-events-none select-none blur-[2px] opacity-40 h-full w-full">
        {children}
      </div>
      {fallback || <LockedOverlay />}
    </div>
  );
}
