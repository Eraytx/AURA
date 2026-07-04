"use client";

import { useState } from "react";
import { Card, Button, Badge, toast } from "@aura/ui";
import { Activity, Play, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

// Mock queues status
const INITIAL_QUEUES = [
  { name: "news-fetch", active: 0, waiting: 0, completed: 1450, failed: 2, status: "healthy" },
  { name: "news-analysis", active: 1, waiting: 0, completed: 890, failed: 1, status: "healthy" },
  { name: "email", active: 0, waiting: 2, completed: 5600, failed: 12, status: "healthy" },
  { name: "notification", active: 0, waiting: 0, completed: 8900, failed: 0, status: "healthy" },
  { name: "cleanup", active: 0, waiting: 0, completed: 30, failed: 0, status: "healthy" },
  { name: "export", active: 0, waiting: 0, completed: 42, failed: 3, status: "healthy" },
  { name: "referral", active: 0, waiting: 0, completed: 124, failed: 1, status: "healthy" },
];

export default function AdminQueuesPage() {
  const [queues, setQueues] = useState(INITIAL_QUEUES);
  const [loading, setLoading] = useState(false);

  const handleRetryFailed = (name: string) => {
    setQueues(
      queues.map((q) => {
        if (q.name === name) {
          toast.success(`${name} kuyruğundaki başarısız işler yeniden tetiklendi.`);
          return { ...q, failed: 0, completed: q.completed + q.failed };
        }
        return q;
      })
    );
  };

  const handleTriggerJob = (name: string) => {
    toast.success(`${name} kuyruğunda manuel iş tetiklendi.`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Kuyruk durumları güncellendi.");
    }, 1000);
  };

  return (
    <div className="p-8 flex flex-col gap-6 select-none font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold" />
            BullMQ Kuyruk Monitörü (Bull Board)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Arkaplan iş kuyrukları derinliği, aktif/bekleyen iş sayıları ve başarısız iş yönetim paneli.
          </p>
        </div>
        <Button onClick={handleRefresh} loading={loading} variant="secondary" className="h-10 text-xs px-4 flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Yenile</span>
        </Button>
      </div>

      {/* Queues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map((q) => {
          const hasFailed = q.failed > 0;
          return (
            <Card key={q.name} className="p-5 bg-background-card border-border/40 flex flex-col justify-between min-h-[220px]">
              
              {/* Title & Status */}
              <div className="flex justify-between items-start border-b border-border/30 pb-3 mb-3">
                <span className="text-xs font-bold text-text-primary font-mono">{q.name}</span>
                <Badge variant={q.status === "healthy" ? "high" : "low"}>
                  {q.status.toUpperCase()}
                </Badge>
              </div>

              {/* Jobs Statistics */}
              <div className="grid grid-cols-2 gap-4 text-xs py-2">
                <div className="flex flex-col gap-1 border-r border-border/30 pr-2">
                  <span className="text-[10px] uppercase text-text-muted">Aktif / Bekleyen</span>
                  <span className="text-sm font-bold text-gold">
                    {q.active} <span className="text-text-muted text-xs">/ {q.waiting}</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-2">
                  <span className="text-[10px] uppercase text-text-muted">Tamamlanan</span>
                  <span className="text-sm font-bold text-text-primary">{q.completed}</span>
                </div>
              </div>

              {/* Fail Alert */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle className={`h-4 w-4 ${hasFailed ? "text-red animate-pulse" : "text-text-muted/40"}`} />
                  <span className={hasFailed ? "text-red font-bold" : "text-text-muted/60"}>
                    {q.failed} Başarısız
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {hasFailed && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRetryFailed(q.name)}
                      className="text-[9px] h-7 px-2 border-red/40 text-red hover:bg-red/10"
                    >
                      Tekrar Dene
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleTriggerJob(q.name)}
                    className="text-[9px] h-7 px-2 bg-gold text-[#0D0D0D] flex items-center gap-1"
                  >
                    <Play className="h-2.5 w-2.5 fill-[#0D0D0D]" />
                    <span>Tetikle</span>
                  </Button>
                </div>
              </div>

            </Card>
          );
        })}
      </div>

    </div>
  );
}
