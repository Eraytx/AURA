"use client";

import { useEffect, useState } from "react";
import { PremiumGate } from "../../../../lib/premium/PremiumGate";
import { Card, Button, Input, toast } from "@aura/ui";
import { Key, Eye, EyeOff, Copy, RefreshCw, AlertTriangle, Cpu } from "lucide-react";
import { env } from "../../../../lib/env";

export default function ApiKeysPage() {
  const [apiKeyList, setApiKeyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const fetchKeys = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setApiKeyList(d.data || []);
    } catch (err: any) {
      toast.error(err.message || "Anahtarlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedKey(null);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: keyName || "AURA API Key" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);

      setGeneratedKey(d.data.rawKey);
      setKeyName("");
      fetchKeys();
      toast.success("Yeni API Anahtarı oluşturuldu. Önceki anahtar iptal edildi.");
    } catch (err: any) {
      toast.error(err.message || "İşlem gerçekleştirilemedi.");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Bu anahtarı iptal etmek istediğinize emin misiniz? Entegrasyonlar çalışmayacaktır.")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setApiKeyList(apiKeyList.filter((k) => k.id !== id));
      toast.success("Anahtar iptal edildi.");
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("API Anahtarı panoya kopyalandı!");
    }
  };

  return (
    <div className="flex-1 p-8 bg-background-primary h-full overflow-y-auto select-none">
      <PremiumGate feature="apiAccess">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Key className="h-5 w-5 text-gold" />
              API Erişimi ve Anahtarlar
            </h1>
            <p className="text-xs text-text-muted mt-1">
              AURA XAUUSD verilerini ve AI analizlerini kendi bot ve uygulamalarınıza entegre edin.
            </p>
          </div>

          {/* Form to generate new API Key */}
          <Card className="bg-background-card border-border/40 p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Yeni API Anahtarı Üret
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Her yeni anahtar üretiminde, önceki aktif anahtarınızın otomatik olarak iptal edileceğini unutmayın.
            </p>

            <form onSubmit={handleGenerateKey} className="flex gap-4 items-end max-w-lg">
              <div className="flex-1">
                <Input
                  label="Anahtar Adı"
                  placeholder="Örn: Telegram Bot Entegrasyonu"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-10 text-xs px-5">
                Anahtar Oluştur
              </Button>
            </form>

            {/* Generated display box */}
            {generatedKey && (
              <div className="mt-4 p-4 border border-gold/30 bg-gold/5 rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Güvenlik Uyarısı: Anahtarınızı şimdi kopyalayın. Bir daha gösterilmeyecektir!</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={showKey ? generatedKey : "••••••••••••••••••••••••••••••••••••"}
                    readOnly
                    className="flex-1 font-mono text-xs h-10"
                    rightIcon={
                      <button type="button" onClick={() => setShowKey(!showKey)} className="text-text-muted hover:text-text-primary">
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                  <Button onClick={handleCopy} variant="secondary" className="h-10 px-3">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Active keys table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Aktif Anahtarlar</h3>
            <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-3">Adı</th>
                    <th className="p-3">Prefix</th>
                    <th className="p-3">Oluşturulma</th>
                    <th className="p-3">Son Kullanım</th>
                    <th className="p-3">İstek Sayısı</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-text-muted/50">Yükleniyor...</td>
                    </tr>
                  ) : apiKeyList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-text-muted/50">Aktif API anahtarınız bulunmuyor.</td>
                    </tr>
                  ) : (
                    apiKeyList.map((key) => (
                      <tr key={key.id} className="border-b border-border last:border-0 hover:bg-background-secondary/10">
                        <td className="p-3 font-semibold">{key.name}</td>
                        <td className="p-3 font-mono text-gold">{key.keyPrefix}...</td>
                        <td className="p-3 text-text-muted">{new Date(key.createdAt).toLocaleDateString("tr-TR")}</td>
                        <td className="p-3 text-text-muted">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString("tr-TR") : "Kullanılmadı"}
                        </td>
                        <td className="p-3 font-bold font-mono">{key.usageCount} / 1000 (günlük)</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="secondary" onClick={() => handleRevokeKey(key.id)} className="text-red hover:bg-red/10 border-0 h-8 px-2.5">
                            İptal Et
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Quick API Docs Mock */}
          <Card className="bg-background-secondary/30 border-border/40 p-6 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              API Entegrasyon Dokümantasyonu
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Hazırladığınız kodlarda `X-API-Key` başlığını ekleyerek endpoints'lerimizi çağırabilirsiniz.
            </p>
            <pre className="p-4 bg-black/60 rounded-lg text-[10px] text-gold font-mono overflow-x-auto leading-relaxed border border-border/20">
{`curl -X GET "${env.NEXT_PUBLIC_APP_URL}/api/v1/news" \\
  -H "X-API-Key: aura_abcdef12..." \\
  -H "Content-Type: application/json"`}
            </pre>
          </Card>
        </div>
      </PremiumGate>
    </div>
  );
}
