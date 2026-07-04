"use client";

import { useState } from "react";
import { Button, Input, Card, Toaster, toast } from "@aura/ui";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İstek gönderilemedi.");

      setSuccess(true);
      toast.success("Şifre sıfırlama bağlantısı gönderildi!");
    } catch (err: any) {
      toast.error(err.message || "İstek sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
      <Toaster />
      <Card className="w-full max-w-md bg-background-card border-border/40 p-8 shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="text-2xl font-bold tracking-wider text-gold flex items-center gap-1.5 font-mono">
            Au <span className="text-text-primary text-xl font-sans tracking-normal font-semibold">AURA XAUUSD</span>
          </span>
          <p className="text-sm text-text-muted">Şifrenizi Kurtarın</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-xs text-text-muted leading-relaxed">
              Hesabınıza kayıtlı e-posta adresinizi girin. Size şifrenizi sıfırlamanız için güvenli bir bağlantı göndereceğiz.
            </p>
            <Input
              label="E-posta"
              type="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center text-green border border-green/20">
              ✓
            </div>
            <p className="text-sm text-text-primary">
              Şifre sıfırlama bağlantısı e-posta adresinize (veya yerel geliştirme konsoluna) başarıyla iletildi.
            </p>
            <p className="text-xs text-text-muted">
              Lütfen gelen kutunuzu kontrol edin ve gelen talimatları uygulayın.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-text-muted mt-8">
          Giriş ekranına geri dönün{" "}
          <Link href="/login" className="text-gold hover:underline font-semibold">
            Giriş Yap
          </Link>
        </p>
      </Card>
    </div>
  );
}
