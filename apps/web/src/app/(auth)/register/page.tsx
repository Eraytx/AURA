"use client";

import { useState } from "react";
import { Button, Input, Card, Toaster, toast } from "@aura/ui";
import { Key, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", score: 0, color: "bg-transparent" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { label: "Çok Zayıf", score: 20, color: "bg-red" };
      case 2:
        return { label: "Zayıf", score: 40, color: "bg-red" };
      case 3:
        return { label: "Orta", score: 60, color: "bg-amber-500" };
      case 4:
        return { label: "Güçlü", score: 80, color: "bg-green" };
      case 5:
        return { label: "Çok Güçlü", score: 100, color: "bg-green" };
      default:
        return { label: "", score: 0, color: "bg-transparent" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt işlemi başarısız.");

      // Store access token and redirect to dashboard directly
      if (data.accessToken) {
        localStorage.setItem("access_token", data.accessToken);
      }
      toast.success("Kayıt başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => {
        window.location.href = "/tr/dashboard";
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Kayıt sırasında bir hata oluştu.");
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
          <p className="text-sm text-text-muted">Ücretsiz AURA hesabı oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Ad Soyad"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
          />
          <Input
            label="E-posta"
            type="email"
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />
          <Input
            label="Şifre"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Key className="h-4 w-4" />}
            required
          />

          {password && (
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-text-muted">
                <span>Şifre Gücü:</span>
                <span className="text-text-primary">{strength.label}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-4">
            Kayıt Ol
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-8">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-gold hover:underline font-semibold">
            Giriş Yapın
          </Link>
        </p>
      </Card>
    </div>
  );
}
