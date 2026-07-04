"use client";

import { useState } from "react";
import { Button, Input, Card, Toaster, toast } from "@aura/ui";
import { Key, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş yapılamadı.");

      // Save token to localStorage for header usage
      if (data.accessToken) {
        localStorage.setItem("access-token", data.accessToken);
      }
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      
      setTimeout(() => {
        window.location.href = "/tr/dashboard";
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Giriş işlemi başarısız.");
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
          <p className="text-sm text-text-muted">Lütfen oturum açın</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex justify-end text-xs">
            <Link href="/forgot-password" className="text-gold hover:underline">
              Şifremi Unuttum
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Giriş Yap
          </Button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-text-muted/50 text-xs uppercase tracking-wider">Veya</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="secondary"
            onClick={() => window.location.href = "/api/auth/oauth/google/redirect"}
            className="flex items-center justify-center gap-1 text-xs"
          >
            Google
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = "/api/auth/oauth/github/redirect"}
            className="flex items-center justify-center gap-1 text-xs"
          >
            GitHub
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = "/api/auth/oauth/discord/redirect"}
            className="flex items-center justify-center gap-1 text-xs"
          >
            Discord
          </Button>
        </div>

        <p className="text-center text-xs text-text-muted mt-8">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-gold hover:underline font-semibold">
            Kayıt Olun
          </Link>
        </p>
      </Card>
    </div>
  );
}
