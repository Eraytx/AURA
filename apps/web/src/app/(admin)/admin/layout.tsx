"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, CreditCard, Calendar, Shield, Activity, Settings, LogOut, ArrowLeft, Loader2, Layers } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@aura/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsAdmin(false);
      router.push("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.user?.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      })
      .catch(() => {
        setIsAdmin(false);
        router.push("/login");
      });
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center text-text-primary">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // blocked
  }

  return (
    <div className="flex h-screen w-screen bg-background-primary text-text-primary overflow-hidden font-sans">
      <Toaster />

      {/* 1. ADMIN SIDEBAR */}
      <aside className="w-64 border-r border-border bg-background-secondary flex flex-col justify-between select-none">
        <div className="flex flex-col">
          {/* Logo / Title */}
          <div className="h-16 px-6 border-b border-border flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-gold" />
            <span className="font-bold text-xs uppercase tracking-widest font-mono text-gold">AURA ADMIN PANEL</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1 text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <Activity className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <Users className="h-4 w-4" />
              <span>Kullanıcılar</span>
            </Link>
            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <CreditCard className="h-4 w-4" />
              <span>Abonelikler</span>
            </Link>
            <Link
              href="/admin/news"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <Calendar className="h-4 w-4" />
              <span>Haberler</span>
            </Link>
            <Link
              href="/admin/logs"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <Activity className="h-4 w-4" />
              <span>Loglar</span>
            </Link>
            <Link
              href="/admin/queues"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <Layers className="h-4 w-4" />
              <span>Kuyruklar</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3.5 py-3 rounded-lg hover:bg-background-primary/50 text-text-muted hover:text-text-primary transition-all font-semibold"
            >
              <Settings className="h-4 w-4" />
              <span>Ayarlar</span>
            </Link>
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-background-primary text-[11px] text-text-muted hover:text-text-primary transition-all font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ana Siteye Dön</span>
          </Link>
        </div>
      </aside>

      {/* 2. ADMIN MAIN WORKSPACE */}
      <main className="flex-1 h-full overflow-y-auto bg-background-primary">
        {children}
      </main>
    </div>
  );
}
