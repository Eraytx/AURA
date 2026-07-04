"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Button, Toaster, toast } from "@aura/ui";
import { Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Doğrulama kodu bulunamadı.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          headers: {
            "Accept": "application/json",
          },
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Doğrulama başarısız.");
        }

        setStatus("success");
        toast.success("E-posta adresiniz doğrulandı!");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Doğrulama işlemi sırasında bir hata oluştu.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
      <Toaster />
      <Card className="w-full max-w-md bg-background-card border-border/40 p-8 shadow-xl text-center">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="text-2xl font-bold tracking-wider text-gold flex items-center gap-1.5 font-mono">
            Au <span className="text-text-primary text-xl font-sans tracking-normal font-semibold">AURA XAUUSD</span>
          </span>
          <p className="text-sm text-text-muted font-sans">E-posta Doğrulama</p>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            <p className="text-sm text-text-primary">E-posta adresiniz doğrulanıyor, lütfen bekleyin...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center text-green border border-green/20">
              ✓
            </div>
            <p className="text-sm text-text-primary font-semibold">Doğrulama Başarılı!</p>
            <p className="text-xs text-text-muted">
              E-posta adresiniz başarıyla onaylandı. Artık platforma giriş yapabilirsiniz.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full mt-4">
              Giriş Ekranına Git
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center text-red border border-red/20 font-bold">
              !
            </div>
            <p className="text-sm text-text-primary font-semibold">Doğrulama Başarısız</p>
            <p className="text-xs text-red">{errorMessage}</p>
            <Button onClick={() => router.push("/login")} variant="secondary" className="w-full mt-4">
              Giriş Ekranına Dön
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background-primary">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
