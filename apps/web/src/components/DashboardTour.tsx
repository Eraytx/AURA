"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@aura/ui";
import { HelpCircle, ChevronRight, X } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  text: string;
  placement: "bottom" | "top" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "economic-calendar-tour",
    title: "Ekonomik Takvim",
    text: "Ekonomik takvim burada. Yüksek etkili makro haberleri filtreleyip anlık geri sayımları takip edebilirsiniz.",
    placement: "right",
  },
  {
    targetId: "news-detail-tour",
    title: "Haber Detayları & AI Analizi",
    text: "Haberlerin detaylı AI analizlerini ve beklenti karşılaştırmalarını buradan anında inceleyin.",
    placement: "left",
  },
  {
    targetId: "reaction-chart-tour",
    title: "Tarihsel Tepki Grafiği",
    text: "Geçmiş benzer haberlerde XAUUSD ons altın paritesinin milisaniyelik fiyat oynaklık reaksiyonları.",
    placement: "top",
  },
  {
    targetId: "simulator-tour",
    title: "Beklenti Sapma Simülatörü",
    text: "Açıklanacak haberin beklenti sapmalarına göre ons altına yapabileceği olası yönsel etkileri simüle edin.",
    placement: "top",
  },
];

export function DashboardTour() {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeen = localStorage.getItem("aura_tour_seen");
    if (!hasSeen) {
      // Small delay to allow page rendering before starting
      const timer = setTimeout(() => {
        setActive(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = rect.top + scrollY;
      let left = rect.left + scrollX;

      if (step.placement === "bottom") {
        top += rect.height + 12;
        left += rect.width / 2 - 140;
      } else if (step.placement === "top") {
        top -= 160;
        left += rect.width / 2 - 140;
      } else if (step.placement === "right") {
        top += rect.height / 2 - 60;
        left += rect.width + 12;
      } else if (step.placement === "left") {
        top += rect.height / 2 - 60;
        left -= 300;
      }

      setCoords({ top, left });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-gold", "ring-offset-2", "ring-offset-background-primary", "transition-all");
    }

    return () => {
      const step = TOUR_STEPS[currentStep];
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove("ring-2", "ring-gold", "ring-offset-2", "ring-offset-background-primary");
      }
    };
  }, [active, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setActive(false);
    localStorage.setItem("aura_tour_seen", "true");
  };

  if (!active) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Tooltip Card */}
      <Card
        className="absolute w-72 p-5 bg-background-card/95 border-gold/40 shadow-2xl pointer-events-auto flex flex-col gap-3 transition-all duration-300 select-none animate-in fade-in duration-200"
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      >
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" />
            {step.title}
          </span>
          <button onClick={handleClose} className="text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-text-primary leading-relaxed">{step.text}</p>

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
          <span className="text-[9px] text-text-muted font-mono font-bold">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>
          <Button onClick={handleNext} className="h-7 text-[10px] px-3 flex items-center gap-1 bg-gold text-[#0D0D0D]">
            <span>{currentStep === TOUR_STEPS.length - 1 ? "Tamamla" : "Sonraki"}</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
