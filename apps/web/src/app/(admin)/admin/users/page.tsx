"use client";

import { useState } from "react";
import { Card, Button, Input, Badge, toast } from "@aura/ui";
import { Search, ShieldAlert, CheckCircle, RefreshCw, Ban, UserCheck, HelpCircle } from "lucide-react";

// Mock users list
const INITIAL_USERS = [
  { id: "1", name: "Ali Yılmaz", email: "ali@example.com", plan: "FREE", role: "FREE", joined: "12-05-2026", status: "active" },
  { id: "2", name: "Ayşe Kaya", email: "ayse@example.com", plan: "MONTHLY", role: "PREMIUM", joined: "01-06-2026", status: "active" },
  { id: "3", name: "Veli Demir", email: "veli@example.com", plan: "YEARLY", role: "PREMIUM", joined: "20-04-2026", status: "active" },
  { id: "4", name: "Can Öztürk", email: "can@example.com", plan: "FREE", role: "ADMIN", joined: "01-01-2026", status: "active" },
  { id: "5", name: "Banned User", email: "banned@example.com", plan: "FREE", role: "FREE", joined: "10-02-2026", status: "banned" }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("ALL");

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "ALL" || u.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const handleToggleBan = (id: string) => {
    setUsers(users.map((u) => {
      if (u.id === id) {
        const nextStatus = u.status === "active" ? "banned" : "active";
        toast.success(nextStatus === "banned" ? "Kullanıcı banlandı." : "Kullanıcı banı kaldırıldı.");
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleTogglePremium = (id: string) => {
    setUsers(users.map((u) => {
      if (u.id === id) {
        const isFree = u.plan === "FREE";
        const nextPlan = isFree ? "MONTHLY" : "FREE";
        const nextRole = isFree ? "PREMIUM" : "FREE";
        toast.success(isFree ? "Kullanıcıya Premium plan atandı." : "Kullanıcı Free plana düşürüldü.");
        return { ...u, plan: nextPlan, role: nextRole };
      }
      return u;
    }));
  };

  const handleResetPassword = (email: string) => {
    toast.success(`Şifre sıfırlama e-postası ${email} adresine gönderildi.`);
  };

  return (
    <div className="p-8 flex flex-col gap-6 select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Kullanıcı Yönetimi</h1>
        <p className="text-xs text-text-muted mt-1">Platform üyelerini arayın, yetkilerini ve ban durumlarını düzenleyin.</p>
      </div>

      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="İsim veya e-posta ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "FREE", "MONTHLY", "YEARLY"].map((p) => (
            <Button
              key={p}
              variant={filterPlan === p ? "primary" : "secondary"}
              onClick={() => setFilterPlan(p)}
              className="text-xs h-9 px-3"
            >
              {p === "ALL" ? "Tümü" : p}
            </Button>
          ))}
        </div>
      </div>

      {/* Users list table */}
      <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
              <th className="p-3">Kullanıcı</th>
              <th className="p-3">E-posta</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Katılma Tarihi</th>
              <th className="p-3">Durum</th>
              <th className="p-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-text-muted/50">Kullanıcı bulunamadı.</td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isBanned = u.status === "banned";
                const isPremium = u.plan !== "FREE";
                
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background-secondary/10">
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 font-mono text-text-muted">{u.email}</td>
                    <td className="p-3">
                      <Badge variant={isPremium ? "high" : "neutral"}>{u.plan}</Badge>
                    </td>
                    <td className="p-3 text-text-muted">{u.joined}</td>
                    <td className="p-3">
                      <Badge variant={isBanned ? "low" : "high"}>
                        {isBanned ? "BANNED" : "ACTIVE"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResetPassword(u.email)}
                        className="text-[10px] h-7 px-2"
                      >
                        Şifre Sıfırla
                      </Button>
                      <Button
                        size="sm"
                        variant={isPremium ? "secondary" : "primary"}
                        onClick={() => handleTogglePremium(u.id)}
                        className="text-[10px] h-7 px-2.5"
                      >
                        {isPremium ? "Free Yap" : "Premium Yap"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleBan(u.id)}
                        className={`text-[10px] h-7 px-2.5 flex items-center gap-1 border-0 ${
                          isBanned ? "text-green hover:bg-green/10" : "text-red hover:bg-red/10"
                        }`}
                      >
                        {isBanned ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        <span>{isBanned ? "Ban Kaldır" : "Banla"}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

    </div>
  );
}
