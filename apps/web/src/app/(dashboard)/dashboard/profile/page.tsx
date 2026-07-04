"use client";

import { Card } from "@aura/ui";

export default function ProfilePage() {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-background-primary">
      <Card className="max-w-xl mx-auto border-border/40">
        <h2 className="text-xl font-bold text-text-primary mb-4">Hesabım</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          AURA XAUUSD profil detaylarınız, Stripe faturalandırma geçmişiniz ve abonelik paketiniz Sprint 2 kapsamında buraya entegre edilecektir.
        </p>
      </Card>
    </div>
  );
}
