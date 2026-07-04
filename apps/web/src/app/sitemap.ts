import { MetadataRoute } from "next";
import { prisma } from "@aura/database";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // Static routes
  const staticPages = ["", "/pricing", "/blog", "/docs", "/about"];
  const languages = ["tr", "en"];
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Generate static pages for all languages
  for (const page of staticPages) {
    for (const lang of languages) {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.6,
      });
    }
  }

  // 2. Fetch last 500 news events to inject dynamic URLs
  try {
    const events = await prisma.newsEvent.findMany({
      select: { id: true, createdAt: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    });

    for (const event of events) {
      for (const lang of languages) {
        sitemapEntries.push({
          url: `${baseUrl}/${lang}/news/${event.id}`,
          lastModified: event.createdAt || new Date(),
          changeFrequency: "hourly",
          priority: 0.8,
        });
      }
    }
  } catch (err) {
    console.error("Failed to generate dynamic sitemap entries:", err);
  }

  return sitemapEntries;
}
