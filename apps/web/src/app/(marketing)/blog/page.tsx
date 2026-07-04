"use client";

import { useState } from "react";
import { BLOG_POSTS, BlogPost } from "../../../content/blog/posts";
import { Card, Button, Badge } from "@aura/ui";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BlogListPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))];

  const filtered = BLOG_POSTS.filter(
    (p) => selectedCategory === "ALL" || p.category === selectedCategory
  );

  const featured = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const others = filtered.filter((p) => p.slug !== featured.slug);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary py-20 px-6 font-sans select-none">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        
        {/* Header Title */}
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase font-bold tracking-widest text-gold">AURA Blog</span>
          <h1 className="text-3xl font-extrabold tracking-tight">Finansal Analizler & Eğitimler</h1>
          <p className="text-xs text-text-muted mt-1">Makro ekonomik haberlerin ons altın (XAUUSD) fiyat hareketi üzerindeki teknik ve temel etkileri.</p>
        </div>

        {/* Categories filters */}
        <div className="flex gap-2 border-b border-border/40 pb-4 overflow-x-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "primary" : "secondary"}
              onClick={() => setSelectedCategory(cat)}
              className="text-xs h-8 px-3.5"
            >
              {cat === "ALL" ? "Tümü" : cat}
            </Button>
          ))}
        </div>

        {/* Featured Post Card */}
        {selectedCategory === "ALL" && featured && (
          <Card className="border-border/40 bg-background-card overflow-hidden flex flex-col md:flex-row gap-6 p-6">
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-gold font-bold uppercase tracking-wider">
                  <Badge variant="high">Öne Çıkan</Badge>
                  <span>{featured.category}</span>
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-tight">
                  {featured.title}
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">{featured.description}</p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-text-muted pt-3 border-t border-border/30">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featured.author}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readingTime} dk okuma</span>
                </span>

                <Link href={`/blog/${featured.slug}`}>
                  <Button size="sm" className="h-8 text-[10px] px-3.5 flex items-center gap-1">
                    <span>Devamını Oku</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Others Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {others.map((post) => (
            <Card key={post.slug} className="p-5 bg-background-card border-border/40 flex flex-col justify-between min-h-[220px]">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-gold font-bold uppercase tracking-wider">{post.category}</span>
                <h3 className="text-sm font-bold text-text-primary leading-snug">{post.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{post.description}</p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-text-muted pt-4 border-t border-border/30 mt-4">
                <span className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} dk okuma
                </span>

                <Link href={`/blog/${post.slug}`}>
                  <Button variant="secondary" className="h-8 text-[10px] px-3 border-border/60 hover:border-gold/30">
                    Makaleyi Oku
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
