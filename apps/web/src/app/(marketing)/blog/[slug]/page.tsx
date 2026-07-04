"use client";

import { useEffect, useState } from "react";
import { BLOG_POSTS, BlogPost } from "../../../../content/blog/posts";
import { Card, Button, toast } from "@aura/ui";
import { Calendar, User, Clock, ArrowLeft, Twitter, Linkedin, Link2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const found = BLOG_POSTS.find((p) => p.slug === params.slug);
    setPost(found || null);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [params.slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center text-text-primary">
        Makale bulunamadı.
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Makale bağlantısı kopyalandı!");
    }
  };

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary py-20 px-6 font-sans select-none relative">
      
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gold z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        
        {/* Back Link */}
        <Link href="/blog" className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-all">
          <ArrowLeft className="h-4 w-4" />
          <span>Tüm Makalelere Dön</span>
        </Link>

        {/* Article Header */}
        <div className="flex flex-col gap-4 border-b border-border/40 pb-6">
          <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{post.category}</span>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {post.publishedAt}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readingTime} dk okuma</span>
          </div>
        </div>

        {/* Article Body Content */}
        <article
          className="text-sm text-text-primary leading-relaxed flex flex-col gap-4 border-b border-border/40 pb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Social Share Bar */}
        <div className="flex items-center justify-between gap-4 py-4 border border-border/40 rounded-xl px-5 bg-background-card/30">
          <span className="text-xs font-bold text-text-muted">Bu Yazıyı Paylaş:</span>
          <div className="flex items-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 border-border/60 hover:border-gold/30">
                <Twitter className="h-4 w-4" />
              </Button>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 border-border/60 hover:border-gold/30">
                <Linkedin className="h-4 w-4" />
              </Button>
            </a>
            <Button size="sm" variant="secondary" onClick={handleCopyLink} className="h-8 w-8 p-0 border-border/60 hover:border-gold/30">
              <Link2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">İlgili Diğer Yazılar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {related.map((rel) => (
              <Card key={rel.slug} className="p-4 bg-background-card border-border/40 flex flex-col justify-between min-h-[140px]">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-gold font-bold uppercase tracking-wider">{rel.category}</span>
                  <h4 className="text-xs font-bold text-text-primary leading-snug">{rel.title}</h4>
                </div>
                <Link href={`/blog/${rel.slug}`} className="text-[10px] font-bold text-gold hover:text-gold-light flex items-center gap-1.5 mt-3">
                  <span>Makaleyi İncele</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
