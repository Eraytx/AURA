"use client";

import { useEffect, useState } from "react";
import { Card, Button, Badge } from "@aura/ui";
import { Activity, ShieldAlert, Eye, Terminal } from "lucide-react";

// Mock audit logs list
const MOCK_LOGS = [
  { id: "1", time: "10:24:12", level: "info", user: "ali@example.com", action: "USER_LOGIN", ip: "192.168.1.45", detail: '{"browser": "Chrome", "os": "Windows"}' },
  { id: "2", time: "10:18:43", level: "warn", user: "system", action: "RATE_LIMIT_TRIGGERED", ip: "172.56.9.110", detail: '{"route": "/api/auth/login", "attempts": 5}' },
  { id: "3", time: "10:05:01", level: "error", user: "ayse@example.com", action: "STRIPE_WEBHOOK_SIGNATURE_FAILED", ip: "3.120.44.15", detail: '{"error": "Webhook signature validation returned status 400"}' },
  { id: "4", time: "09:59:12", level: "info", user: "veli@example.com", action: "FAVORITE_ADD", ip: "192.168.1.100", detail: '{"eventId": "cpi_id_2026"}' },
  { id: "5", time: "09:48:30", level: "info", user: "can@example.com", action: "ADMIN_NEWS_REFETCH", ip: "127.0.0.1", detail: '{"eventId": "nfp_id_2026", "reason": "refetch request"}' }
];

export default function AdminLogsPage() {
  const [selectedJson, setSelectedJson] = useState<string | null>(null);

  return (
    <div className="p-8 flex flex-col gap-6 select-none relative">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Terminal className="h-5 w-5 text-gold" />
          Sistem Audit Logları
        </h1>
        <p className="text-xs text-text-muted mt-1">Platform genelinde gerçekleşen kritik kullanıcı ve ödeme olayları log geçmişi.</p>
      </div>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden border-border/40 bg-background-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-background-secondary/50 text-text-muted uppercase text-[10px] font-bold tracking-wider">
              <th className="p-3">Zaman</th>
              <th className="p-3">Level</th>
              <th className="p-3">Kullanıcı</th>
              <th className="p-3">Action</th>
              <th className="p-3">IP Adresi</th>
              <th className="p-3 text-right">Detaylar</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LOGS.map((log) => {
              const isError = log.level === "error";
              const isWarn = log.level === "warn";
              
              const rowClass = isError
                ? "bg-red/5 hover:bg-red/10 border-red/10 text-red"
                : isWarn
                  ? "bg-amber/5 hover:bg-amber/10 border-amber/10 text-amber"
                  : "hover:bg-background-secondary/10 border-border";

              return (
                <tr key={log.id} className={`border-b last:border-0 transition-colors ${rowClass}`}>
                  <td className="p-3 font-mono font-bold text-text-muted">{log.time}</td>
                  <td className="p-3 uppercase font-bold text-[10px]">
                    <span className={`px-2 py-0.5 rounded ${
                      isError ? "bg-red/15 text-red" : isWarn ? "bg-amber/15 text-amber" : "bg-white/5 text-text-muted"
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{log.user}</td>
                  <td className="p-3 font-mono">{log.action}</td>
                  <td className="p-3 font-mono text-text-muted">{log.ip}</td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedJson(log.detail)}
                      className="text-[10px] h-7 px-2.5 flex items-center gap-1 ml-auto border-border/30 hover:border-gold/30"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Görüntüle</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* JSON Viewer Modal Overlay */}
      {selectedJson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedJson(null)}
        >
          <div
            className="w-full max-w-md border border-border bg-background-card rounded-xl overflow-hidden shadow-2xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Terminal className="h-4 w-4" />
                Log Detay Görüntüleyici
              </span>
              <button onClick={() => setSelectedJson(null)} className="text-text-muted hover:text-text-primary text-sm font-bold">
                ✕
              </button>
            </div>
            
            <pre className="p-4 bg-black/60 rounded-lg text-[10px] text-green font-mono overflow-x-auto leading-relaxed border border-border/20">
              {JSON.stringify(JSON.parse(selectedJson), null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedJson(null)} size="sm" className="px-4">
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
