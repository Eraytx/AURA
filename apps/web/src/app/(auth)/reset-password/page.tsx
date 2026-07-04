"use client";

import { useState, useEffect, Suspense } from "react";
import { Button, Input, Card, Toaster, toast } from "@aura/ui";
import { Key, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Şifre sıfırlama kodu eksik veya geçersiz.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Geçersiz sıfırlama kodu.");
      return;
    }
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Şifreler uyuşmuyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Şifre güncellenemedi.");

      setSuccess(true);
      toast.success("Şifreniz güncellendi!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.");
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
          <p className="text-sm text-text-muted">Yeni Şifrenizi Belirleyin</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Yeni Şifre"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Key className="h-4 w-4" />}
              required
            />
            <Input
              label="Yeni Şifre (Tekrar)"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Key className="h-4 w-4" />}
              required
            />
            <Button type="submit" loading={loading} disabled={!token} className="w-full mt-2">
              Şifreyi Güncelle
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center text-green border border-green/20">
              ✓
            </div>
            <p className="text-sm text-text-primary">Şifreniz başarıyla değiştirildi.</p>
            <p className="text-xs text-text-muted">Giriş ekranına yönlendiriliyorsunuz...</p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background-primary">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
