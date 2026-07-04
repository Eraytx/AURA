"use client";

import { Card, Badge, Button, toast } from "@aura/ui";
import { CreditCard, DollarSign, TrendingDown, ExternalLink } from "lucide-react";

// Mock subscriptions list
const MOCK_SUBSCRIPTIONS = [
  { id: "sub_1", user: "Ayşe Kaya", email: "ayse@example.com", plan: "MONTHLY", started: "12-05-2026", expires: "12-07-2026", amount: "$9.99", status: "active" },
  { id: "sub_2", user: "Veli Demir", email: "veli@example.com", plan: "YEARLY", started: "20-04-2026", expires: "20-04-2027", amount: "$79.99", status: "active" },
  { id: "sub_3", user: "Ece Kara", email: "ece@example.com", plan: "MONTHLY", started: "01-05-2026", expires: "01-06-2026", amount: "$9.99", status: "canceled" },
  { id: "sub_4", user: "Murat Koç", email: "murat@example.com", plan: "MONTHLY", started: "10-06-2026", expires: "13-06-2026", amount: "$9.99", status: "past_due" }
];

export default function AdminSubscriptionsPage() {
  const handleCancelSub = (subId: string) => {
    if (confirm("Bu aboneliği iptal etmek istediğinize emin misiniz?")) {
      toast.success("Abonelik iptal edildi (Stripe üzerinde iptal talimatı gönderildi).");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6 select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Abonelik Yönetimi</h1>
        <p className="text-xs text-text-muted mt-1">Platform gelir durumlarını, aktif ve iptal olan üyelikleri yönetin.</p>
      </div>

      {/* 3 Upper cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aylık Toplam Gelir (MRR)</span>
            <span className="text-2xl font-bold text-text-primary">$891.00</span>
          </div>
          <DollarSign className="h-8 w-8 text-gold/40" />
        </Card>

        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aktif Premium Abonelik</span>
            <span className="text-2xl font-bold text-green">89</span>
          </div>
          <CreditCard className="h-8 w-8 text-green/45" />
        </Card>

        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Müşteri Kayıp Oranı (Churn Rate)</span>
            <span className="text-2xl font-bold text-text-primary">%4.2</span>
          </div>
          <TrendingDown className="h-8 w-8 text-gold/40" />
        </Card>
      </div>

      {/* Subscriptions table */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Tüm Abonelikler</h3>
        <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <th className="p-3">Kullanıcı</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Başlangıç</th>
                <th className="p-3">Yenilenme/Bitiş</th>
                <th className="p-3">Tutar</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SUBSCRIPTIONS.map((sub) => {
                const isActive = sub.status === "active";
                const isPastDue = sub.status === "past_due";
                return (
                  <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-background-secondary/10">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">{sub.user}</span>
                        <span className="text-[10px] text-text-muted font-mono">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{sub.plan}</td>
                    <td className="p-3 text-text-muted">{sub.started}</td>
                    <td className="p-3 text-text-muted">{sub.expires}</td>
                    <td className="p-3 font-bold font-mono">{sub.amount}</td>
                    <td className="p-3">
                      <Badge variant={isActive ? "high" : isPastDue ? "medium" : "neutral"}>
                        {sub.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <a href={`https://dashboard.stripe.com/subscriptions/${sub.id}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary" className="text-[10px] h-8 px-2.5 flex items-center gap-1">
                          <span>Stripe'da Gör</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                      {isActive && (
                        <Button size="sm" variant="secondary" onClick={() => handleCancelSub(sub.id)} className="text-[10px] h-8 px-2.5 text-red hover:bg-red/10 border-0">
                          İptal Et
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

    </div>
  );
}
