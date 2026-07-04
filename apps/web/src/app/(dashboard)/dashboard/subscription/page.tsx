"use client";

import { useEffect, useState } from "react";
import { Card, Button, Badge, toast } from "@aura/ui";
import { CreditCard, ShieldAlert, Download, Sliders, ExternalLink } from "lucide-react";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSubscriptionDetails = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const [subRes, invRes] = await Promise.all([
        fetch("/api/stripe/subscription", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/invoices", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const subData = await subRes.json();
      const invData = await invRes.json();

      setSubscription(subData.data);
      setInvoices(invData.data || []);
    } catch {
      toast.error("Abonelik bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handlePortalRedirect = async () => {
    const token = localStorage.getItem("access_token");
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);

      if (d.url) {
        window.location.href = d.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Fatura yönetim portalına yönlendirilemedi.");
      setPortalLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-text-muted/60 font-mono">Yükleniyor...</div>;
  }

  const isFree = !subscription || subscription.plan === "FREE";
  const expireDate = subscription?.planExpiresAt
    ? new Date(subscription.planExpiresAt).toLocaleDateString("tr-TR")
    : null;

  return (
    <div className="flex-1 p-8 bg-background-primary h-full overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gold" />
            Abonelik ve Fatura Yönetimi
          </h1>
          <p className="text-xs text-text-muted mt-1">Plan detaylarınızı inceleyin, faturalarınızı yönetin ve ödeme ayarlarınızı güncelleyin.</p>
        </div>

        {/* Current status card */}
        <Card className="bg-background-card border-border/40 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg text-gold shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">Mevcut Planınız:</span>
                <Badge variant={isFree ? "neutral" : "high"}>
                  {isFree ? "FREE PLAN" : `PREMIUM (${subscription.plan})`}
                </Badge>
              </div>
              <span className="text-xs text-text-muted mt-1 leading-relaxed">
                {isFree
                  ? "Sınırlı takvim görünümü ve temel haber analizi özeti. AI simülatörü ve geçmiş verilere erişim kapalıdır."
                  : `Tüm premium özellikler aktiftir. Abonelik yenilenme/bitiş tarihi: ${expireDate}`}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            {isFree ? (
              <Button onClick={() => window.location.href = "/pricing"} className="h-10 text-xs px-5">
                Premium Planları Gör
              </Button>
            ) : (
              <Button loading={portalLoading} onClick={handlePortalRedirect} variant="secondary" className="h-10 text-xs px-5 flex items-center gap-1.5">
                <span>Planı Yönet / İptal Et</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </Card>

        {/* Failed payment grace warning banner */}
        {!isFree && subscription.planExpiresAt && (
          <div className="p-4 bg-red/10 border border-red/20 text-red rounded-lg text-xs flex gap-3.5 items-center">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold">Ödeme Durumu Uyarısı:</span>
              <p className="mt-0.5 text-[11px] text-red/80">
                Aboneliğiniz şu anda aktiftir. Sonraki ödeme tarihi {expireDate} olarak programlanmıştır. Ödeme sorunu yaşanması durumunda hesabınız 3 günün ardından otomatik olarak ücretsiz plana geçirilecektir.
              </p>
            </div>
          </div>
        )}

        {/* Invoices list */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Fatura Geçmişi</h3>
          <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3">Fatura No</th>
                  <th className="p-3">Dönem</th>
                  <th className="p-3">Tutar</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">Fatura PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-text-muted/50">Kayıtlı faturanız bulunmuyor.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const dateRange = `${new Date(inv.periodStart).toLocaleDateString("tr-TR")} - ${new Date(
                      inv.periodEnd
                    ).toLocaleDateString("tr-TR")}`;
                    return (
                      <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-background-secondary/10">
                        <td className="p-3 font-mono text-gold">{inv.stripeInvoiceId}</td>
                        <td className="p-3 text-text-muted">{dateRange}</td>
                        <td className="p-3 font-semibold">${(inv.amount / 100).toFixed(2)}</td>
                        <td className="p-3">
                          <Badge variant="high">{inv.status.toUpperCase()}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="secondary" className="h-8 text-[10px] px-2.5 flex items-center gap-1 ml-auto">
                              <Download className="h-3.5 w-3.5" />
                              <span>İndir (PDF)</span>
                            </Button>
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>

      </div>
    </div>
  );
}
