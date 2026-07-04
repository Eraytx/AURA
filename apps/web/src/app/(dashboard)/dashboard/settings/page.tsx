"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, toast } from "@aura/ui";
import { Settings, ShieldAlert, User, Bell, Trash2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Notification toggles
  const [notifyHighImpact, setNotifyHighImpact] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);
  const [notifyBrowser, setNotifyBrowser] = useState(false);
  const [language, setLanguage] = useState("tr");

  // Danger Zone delete state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

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
          setUser(u);
          setName(u.name || "");
          setEmail(u.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profil bilgileri güncellendi (Simüle).");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "SİL") {
      toast.warning("Hesabınızı silmek için 'SİL' yazmalısınız.");
      return;
    }

    setDeleteLoading(true);
    // Simulate delete account api call
    setTimeout(() => {
      localStorage.removeItem("access_token");
      toast.success("Hesabınız kalıcı olarak silindi.");
      router.push("/register");
    }, 1500);
  };

  return (
    <div className="flex-1 p-8 bg-background-primary h-full overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Settings className="h-5 w-5 text-gold" />
            Hesap ve Bildirim Ayarları
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Hesap profili, e-posta bildirimleri ve güvenlik ayarlarınızı yapılandırın.
          </p>
        </div>

        {/* 1. Profile Box */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 border-b border-border/30 pb-2">
            <User className="h-4 w-4 text-gold" />
            Profil Bilgileri
          </h3>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            <Input label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="E-posta Adresi" value={email} readOnly className="opacity-60 cursor-not-allowed" />
            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="text-xs px-5 h-9">
                Kaydet
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Notification Box */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 border-b border-border/30 pb-2">
            <Bell className="h-4 w-4 text-gold" />
            Bildirim Tercihleri
          </h3>
          <div className="flex flex-col gap-3.5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyHighImpact}
                onChange={() => setNotifyHighImpact(!notifyHighImpact)}
                className="rounded border-border text-gold bg-background-primary focus:ring-gold"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">Yüksek Etkili Haber Alerleri (E-posta)</span>
                <span className="text-[10px] text-text-muted">High impact USD haberleri açıklanmadan 15 dk önce email gönderilir.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyWeeklyDigest}
                onChange={() => setNotifyWeeklyDigest(!notifyWeeklyDigest)}
                className="rounded border-border text-gold bg-background-primary focus:ring-gold"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">Haftalık Bülten Digest</span>
                <span className="text-[10px] text-text-muted">XAUUSD haftalık piyasa performansı ve reaksiyon özeti gönderilir.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyBrowser}
                onChange={() => setNotifyBrowser(!notifyBrowser)}
                className="rounded border-border text-gold bg-background-primary focus:ring-gold"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-primary">Anlık Tarayıcı Bildirimleri</span>
                <span className="text-[10px] text-text-muted">Haber gerçekleşen değerleri geldiğinde SSE akışıyla tarayıcı üzerinden uyarır.</span>
              </div>
            </label>
          </div>
        </Card>

        {/* 3. Language settings */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5 border-b border-border/30 pb-2">
            <Globe className="h-4 w-4 text-gold" />
            Dil Seçenekleri
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage("tr")}
              className={`px-4 py-2 border text-xs font-bold rounded-lg transition-all ${
                language === "tr" ? "border-gold text-gold bg-gold/5" : "border-border text-text-muted hover:text-text-primary"
              }`}
            >
              Türkçe (TR)
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 border text-xs font-bold rounded-lg transition-all ${
                language === "en" ? "border-gold text-gold bg-gold/5" : "border-border text-text-muted hover:text-text-primary"
              }`}
            >
              English (EN)
            </button>
          </div>
        </Card>

        {/* 4. Danger Zone */}
        <Card className="border-red/30 bg-red/5 p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red flex items-center gap-1.5 border-b border-red/20 pb-2">
            <Trash2 className="h-4 w-4" />
            Danger Zone (Hesap Silme)
          </h3>
          <p className="text-xs text-red/80 leading-relaxed">
            Hesabınızı silmeniz durumunda tüm geçmiş abonelik kayıtlarınız, faturalarınız ve favori verileriniz kalıcı olarak kaldırılacaktır. Bu işlem geri alınamaz.
          </p>
          <div className="flex flex-col gap-2.5 max-w-md mt-2">
            <Input
              label="Onaylamak için 'SİL' yazın"
              placeholder="SİL"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="border-red/40 focus:border-red"
            />
            <Button
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              className="bg-red hover:bg-red-light text-white text-xs h-10 w-fit px-6 mt-1"
            >
              Hesabı Kalıcı Olarak Sil
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
