"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Home, Star, Settings, FileText, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import "./CommandPalette.css"; // We will add styling classes

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newsResults, setNewsResults] = useState<any[]>([]);

  // Toggle Command Palette on Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch news dynamically when user searches inside the command palette
  useEffect(() => {
    if (!search.trim()) {
      setNewsResults([]);
      return;
    }

    const token = localStorage.getItem("access_token");
    fetch(`/api/news/search?q=${encodeURIComponent(search)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json().then((d) => d.data || []);
      })
      .then((data) => setNewsResults(data))
      .catch(() => setNewsResults([]));
  }, [search]);

  if (!open) return null;

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg border border-border bg-background-card rounded-xl overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Hızlı Erişim Paleti" className="font-sans">
          <div className="flex items-center border-b border-border px-4 py-3 gap-3">
            <Search className="h-4 w-4 text-text-muted" />
            <Command.Input
              autoFocus
              placeholder="Komut yazın veya haber arayın (Ctrl+K)..."
              value={search}
              onValueChange={setSearch}
              className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted/50 focus:outline-none"
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
            <Command.Empty className="text-xs text-text-muted/60 p-4 text-center select-none">
              Arama sonucu bulunamadı.
            </Command.Empty>

            {/* General Navigation Group */}
            <Command.Group heading="Kısayollar ve Gezinti" className="text-[10px] font-bold text-text-muted uppercase px-3 py-1.5 tracking-wider select-none">
              <Command.Item
                onSelect={() => handleNavigate("/dashboard")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-background-secondary/50 cursor-pointer transition-all"
              >
                <Home className="h-4 w-4" />
                <span>Panel Ana Sayfası</span>
                <kbd className="ml-auto text-[10px] bg-background-secondary border border-border px-1.5 py-0.5 rounded text-text-muted font-mono font-bold uppercase">H</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleNavigate("/dashboard/profile")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-background-secondary/50 cursor-pointer transition-all"
              >
                <Star className="h-4 w-4" />
                <span>Favori Haberlerim</span>
                <kbd className="ml-auto text-[10px] bg-background-secondary border border-border px-1.5 py-0.5 rounded text-text-muted font-mono font-bold uppercase">F</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleNavigate("/dashboard/settings")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-background-secondary/50 cursor-pointer transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Sistem Ayarları</span>
                <kbd className="ml-auto text-[10px] bg-background-secondary border border-border px-1.5 py-0.5 rounded text-text-muted font-mono font-bold uppercase">S</kbd>
              </Command.Item>
            </Command.Group>

            {/* News Results Group */}
            {newsResults.length > 0 && (
              <Command.Group heading="Haber Arama Sonuçları" className="text-[10px] font-bold text-text-muted uppercase px-3 py-1.5 tracking-wider select-none border-t border-border/30 mt-2 pt-2">
                {newsResults.map((event) => (
                  <Command.Item
                    key={event.id}
                    onSelect={() => {
                      setOpen(false);
                      // Custom routing or triggering event select in parent layout
                      window.dispatchEvent(new CustomEvent("select_event", { detail: event }));
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-background-secondary/50 cursor-pointer transition-all"
                  >
                    <Calendar className="h-4 w-4 text-gold/70" />
                    <div className="flex flex-col gap-0.5 truncate">
                      <span className="text-text-primary font-medium truncate">{event.titleEn}</span>
                      <span className="text-[10px] text-text-muted truncate">{event.title}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
