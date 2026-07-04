"use client";

import { useEffect, useState } from "react";
import { Card, Button, Badge, toast } from "@aura/ui";
import { Star, ExternalLink, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch("/api/news/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setFavorites(d.data || []);
    } catch (err: any) {
      toast.error(err.message || "Favori verileri çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (eventId: string) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/news/${eventId}/favorite`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFavorites(favorites.filter((fav) => fav.id !== eventId));
      toast.success("Favorilerden çıkarıldı.");
    } catch {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  return (
    <div className="flex-1 p-8 bg-background-primary h-full overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Star className="h-5 w-5 text-gold fill-current" />
            Favori Haberlerim
          </h1>
          <p className="text-xs text-text-muted mt-1">Önemli bulduğunuz ve takibe aldığınız haber analizleri listesi.</p>
        </div>

        {loading ? (
          <div className="text-xs text-text-muted/60">Yükleniyor...</div>
        ) : favorites.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-text-muted">
            <Star className="h-8 w-8 text-gold/40 mb-3" />
            <p className="text-xs font-semibold">Henüz favori eklemediniz.</p>
            <p className="text-[10px] text-text-muted/70 mt-1 max-w-[240px] text-center">
              Takvimdeki haberlerin detay panelinde yer alan favori ikonuna tıklayarak ekleme yapabilirsiniz.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((event) => (
              <Card key={event.id} className="p-4 bg-background-card border-border/40 flex flex-col justify-between h-[150px]">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-text-primary truncate max-w-[200px]">
                      {event.titleEn}
                    </span>
                    <Badge variant={event.impact.toLowerCase() as any}>{event.impact}</Badge>
                  </div>
                  <p className="text-[10px] text-text-muted truncate">{event.title}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-text-muted pt-3 border-t border-border/30">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {event.eventTime}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleRemoveFavorite(event.id)}
                      className="p-1 h-7 w-7 text-red hover:bg-red/10 border-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/dashboard?event=${event.id}`}>
                      <Button className="h-7 text-[10px] px-2.5 flex items-center gap-1">
                        <span>Detaya Git</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
