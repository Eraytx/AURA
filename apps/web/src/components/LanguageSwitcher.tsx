"use client";

import { useTranslation } from "./LocaleProvider";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  const handleSelect = (lang: "tr" | "en") => {
    setLocale(lang);
    setOpen(false);
  };

  return (
    <div className="relative font-sans select-none">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background-primary text-text-primary text-xs hover:border-gold/30 transition-all font-semibold"
      >
        <Globe className="h-3.5 w-3.5 text-gold" />
        <span>{locale === "tr" ? "🇹🇷 Türkçe" : "🇬🇧 English"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
      </button>

      {open && (
        <>
          {/* Click outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          
          <div className="absolute right-0 mt-1.5 w-32 border border-border bg-background-card rounded-lg overflow-hidden shadow-xl z-50 flex flex-col p-1 gap-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-100">
            <button
              onClick={() => handleSelect("tr")}
              className={`flex items-center gap-2 px-3 py-2 rounded text-left text-xs font-semibold hover:bg-background-secondary/50 w-full transition-all ${
                locale === "tr" ? "text-gold bg-gold/5" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>🇹🇷</span>
              <span>Türkçe</span>
            </button>
            <button
              onClick={() => handleSelect("en")}
              className={`flex items-center gap-2 px-3 py-2 rounded text-left text-xs font-semibold hover:bg-background-secondary/50 w-full transition-all ${
                locale === "en" ? "text-gold bg-gold/5" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
