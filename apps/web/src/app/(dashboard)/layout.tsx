"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Badge,
  Card,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  Toaster,
  toast,
} from "@aura/ui";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Key,
  Star,
  CreditCard,
  Gift,
  Activity,
  Maximize2,
  TrendingUp,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { PriceTicker } from "../../components/PriceTicker";
import { CommandPalette } from "../../components/CommandPalette";
import { PremiumProvider } from "../../lib/premium/PremiumGate";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  avatarUrl?: string;
}

interface NewsEvent {
  id: string;
  title: string;
  titleEn: string;
  currency: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  forecast: string;
  actual: string;
  previous: string;
  eventTime: string;
  category: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [timeET, setTimeET] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Live ET (New York) Clock
  useEffect(() => {
    const updateTime = () => {
      const etStr = new Date().toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTimeET(etStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current user details
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Build headers — if no localStorage token, server will fallback to access-token cookie
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch("/api/auth/me", { headers, credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        // Access token expired or invalid, clear client state
        localStorage.removeItem("access_token");
        setUser(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("access_token");
      setUser(null);
      toast.success("Oturum kapatıldı.");
      router.push("/login");
    } catch {
      toast.error("Oturum kapatılırken hata oluştu.");
    }
  };

  return (
    <PremiumProvider>
      <div className="flex h-screen flex-col bg-background-primary text-text-primary overflow-hidden font-sans">
        <Toaster />
        
        {/* 1. NAVBAR */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background-secondary px-6 select-none z-10">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold tracking-wider text-gold flex items-center gap-2 font-mono">
              Au <span className="text-text-primary text-lg font-sans tracking-normal font-semibold">AURA XAUUSD</span>
            </Link>
          </div>

          {/* Center: Price Ticker & Live Clock */}
          <div className="flex items-center gap-6">
            <PriceTicker />
            <div className="hidden md:flex items-center gap-2 bg-background-primary border border-border px-3.5 py-1.5 rounded-full text-xs font-mono">
              <Activity className="h-3.5 w-3.5 text-green animate-pulse" />
              <span className="text-text-muted">NEW YORK (ET):</span>
              <span className="text-text-primary font-bold">{timeET || "00:00:00"}</span>
            </div>
          </div>

          {/* Right Auth Block */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <Dropdown>
                <DropdownTrigger className="focus:outline-none cursor-pointer">
                  <Avatar fallback={user.name.substring(0, 2)} online />
                </DropdownTrigger>
                <DropdownContent className="w-56 mt-2">
                  <DropdownLabel>{user.name}</DropdownLabel>
                  <div className="px-2.5 pb-2 text-xs text-text-muted">{user.email}</div>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => router.push("/dashboard")}>
                    <Activity className="mr-2.5 h-4 w-4" />
                    <span>Ekonomik Takvim</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/dashboard/favorites")}>
                    <Star className="mr-2.5 h-4 w-4" />
                    <span>Favorilerim</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/dashboard/api-keys")}>
                    <Key className="mr-2.5 h-4 w-4" />
                    <span>API Anahtarları</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/dashboard/subscription")}>
                    <CreditCard className="mr-2.5 h-4 w-4" />
                    <span>Aboneliğim</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/dashboard/referral")}>
                    <Gift className="mr-2.5 h-4 w-4" />
                    <span>Referral Davet</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2.5 h-4 w-4" />
                    <span>Ayarlar</span>
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={handleLogout} className="text-red hover:bg-red/10">
                    <LogOut className="mr-2.5 h-4 w-4 text-inherit" />
                    <span>Oturumu Kapat</span>
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/login")} size="sm">
                  Giriş Yap
                </Button>
                <Button onClick={() => router.push("/register")} size="sm">
                  Kayıt Ol
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Main Grid Frame */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Render children - wraps our dashboard content panels */}
          {children}
        </div>
        <CommandPalette />
      </div>
    </PremiumProvider>
  );
}
