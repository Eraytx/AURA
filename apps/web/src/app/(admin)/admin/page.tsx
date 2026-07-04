"use client";

import { Card } from "@aura/ui";
import { Users, CreditCard, DollarSign, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Mock data for admin charts
const USER_GROWTH = [
  { day: "1", users: 1050 },
  { day: "5", users: 1080 },
  { day: "10", users: 1120 },
  { day: "15", users: 1150 },
  { day: "20", users: 1200 },
  { day: "25", users: 1220 },
  { day: "30", users: 1247 },
];

const REVENUE_12M = [
  { month: "Oca", mrr: 450 },
  { month: "Şub", mrr: 520 },
  { month: "Mar", mrr: 580 },
  { month: "Nis", mrr: 640 },
  { month: "May", mrr: 720 },
  { month: "Haz", mrr: 891 },
];

const PLAN_DISTRIBUTION = [
  { name: "FREE", value: 1158, color: "#999890" },
  { name: "MONTHLY", value: 65, color: "#D4A017" },
  { name: "YEARLY", value: 24, color: "#22C55E" },
];

const ACTIVITIES = [
  { time: "10 dk önce", text: "Yeni kullanıcı kayıt oldu: ahmet@example.com" },
  { time: "25 dk önce", text: "Premium abonelik başarıyla başlatıldı: stripe_sub_8921" },
  { time: "1 saat önce", text: "Başarısız ödeme uyarısı (grace period): mehmet@example.com" },
  { time: "3 saat önce", text: "Yapay zeka analizi yenilendi: CPI Economic News" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8 flex flex-col gap-6 select-none">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Admin Yönetim Kontrol Paneli</h1>
        <p className="text-xs text-text-muted mt-1">Platform genel istatistikleri ve finansal durum özeti.</p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Toplam Kullanıcı</span>
            <span className="text-2xl font-bold text-text-primary">1,247</span>
          </div>
          <Users className="h-8 w-8 text-gold/45" />
        </Card>

        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aktif Premium</span>
            <span className="text-2xl font-bold text-green">89</span>
          </div>
          <CreditCard className="h-8 w-8 text-green/45" />
        </Card>

        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aylık Gelir (MRR)</span>
            <span className="text-2xl font-bold text-text-primary">$891/ay</span>
          </div>
          <DollarSign className="h-8 w-8 text-gold/45" />
        </Card>

        <Card className="p-5 bg-background-card border-border/40 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Bugün Kayıt</span>
            <span className="text-2xl font-bold text-gold">+12</span>
          </div>
          <Activity className="h-8 w-8 text-gold/45" />
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Growth Line Chart */}
        <Card className="p-4 bg-background-card border-border/40 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Kullanıcı Büyümesi (Son 30 Gün)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={USER_GROWTH} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
                <XAxis dataKey="day" stroke="#999890" fontSize={10} />
                <YAxis stroke="#999890" fontSize={10} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A1A" }} />
                <Line type="monotone" dataKey="users" name="Kullanıcı" stroke="#D4A017" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Plan Distribution Pie Chart */}
        <Card className="p-4 bg-background-card border-border/40 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Plan Dağılımı</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PLAN_DISTRIBUTION} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {PLAN_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-[10px] text-text-muted font-mono">
            {PLAN_DISTRIBUTION.map((entry, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </Card>

        {/* Monthly Revenue Bar Chart */}
        <Card className="p-4 bg-background-card border-border/40 lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">MRR Büyümesi (Son 6 Ay)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_12M} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
                <XAxis dataKey="month" stroke="#999890" fontSize={10} />
                <YAxis stroke="#999890" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A1A" }} />
                <Bar dataKey="mrr" name="MRR ($)" fill="#D4A017" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity List */}
        <Card className="p-4 bg-background-card border-border/40 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Son Sistem Aktiviteleri</h3>
          <div className="flex flex-col gap-3">
            {ACTIVITIES.map((act, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-b border-border/30 last:border-0 pb-3 last:pb-0">
                <span className="text-[10px] text-gold font-semibold font-mono">{act.time}</span>
                <p className="text-xs text-text-primary leading-relaxed">{act.text}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
