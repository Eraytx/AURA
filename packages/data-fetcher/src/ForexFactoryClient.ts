import { z } from "zod";
import Redis from "ioredis";
import { prisma } from "@aura/database";

export const ForexFactoryEventSchema = z.object({
  title: z.string(),
  country: z.string(),
  date: z.string(),
  time: z.string(),
  impact: z.string(),
  forecast: z.string().optional().nullable(),
  previous: z.string().optional().nullable(),
  actual: z.string().optional().nullable(),
});

export type ForexFactoryEvent = z.infer<typeof ForexFactoryEventSchema>;

const XAUUSD_RELEVANT_KEYWORDS = [
  "USD", "XAU", "Gold",
  "CPI", "NFP", "FOMC", "Fed", "PCE",
  "GDP", "PPI", "ISM", "Retail Sales",
  "Unemployment", "Interest Rate",
  "Treasury", "Inflation", "PMI",
  "Consumer Confidence", "JOLTS", "ADP"
];

export class ForexFactoryClient {
  private redis: Redis | null = null;

  constructor() {
    try {
      const redisUrl = process.env.UPSTASH_REDIS_URL || "redis://localhost:6379";
      this.redis = new Redis(redisUrl);
    } catch (err) {
      console.warn("⚠️ Redis client connection could not be established in data-fetcher. Real-time publish will be skipped.");
    }
  }

  // Check relevance of event
  public isXauusdRelevant(event: ForexFactoryEvent): boolean {
    const titleLower = event.title.toLowerCase();
    const countryLower = event.country.toLowerCase();
    
    return XAUUSD_RELEVANT_KEYWORDS.some((kw) => {
      const kwLower = kw.toLowerCase();
      return titleLower.includes(kwLower) || countryLower.includes(kwLower);
    });
  }

  // Fetch with exponential backoff retry logic (3 retries)
  public async fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<ForexFactoryEvent[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Zod validation
        const parsed = z.array(ForexFactoryEventSchema).safeParse(data);
        if (!parsed.success) {
          throw new Error(`Validation Error: ${parsed.error.message}`);
        }

        return parsed.data;
      } catch (err: any) {
        console.error(`Attempt ${attempt} failed fetching ${url}: ${err.message}`);
        if (attempt === retries) throw err;
        
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
    return [];
  }

  // Fetch both weeks and upsert
  public async syncCalendar(): Promise<void> {
    console.log("Starting calendar synchronization...");
    
    try {
      const thisWeekUrl = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
      const nextWeekUrl = "https://nfs.faireconomy.media/ff_calendar_nextweek.json";

      const [thisWeekEvents, nextWeekEvents] = await Promise.all([
        this.fetchWithRetry(thisWeekUrl),
        this.fetchWithRetry(nextWeekUrl).catch((err) => {
          console.warn("Gelecek hafta verileri alınamadı, bu hafta ile devam ediliyor:", err.message);
          return [] as ForexFactoryEvent[];
        })
      ]);

      const allEvents = [...thisWeekEvents, ...nextWeekEvents];
      const relevant = allEvents.filter(this.isXauusdRelevant);

      console.log(`Fetched ${allEvents.length} events total. Relevant to XAUUSD: ${relevant.length}`);

      for (const event of relevant) {
        const mappedImpact = event.impact.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
        

        const existing = await prisma.newsEvent.findFirst({
          where: {
            title: event.title,
            eventTime: event.time,
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 14)) // lookup last 2 weeks to verify match
            }
          }
        });

        let savedEvent;
        if (existing) {
          savedEvent = await prisma.newsEvent.update({
            where: { id: existing.id },
            data: {
              forecast: event.forecast || null,
              actual: event.actual || null,
              previous: event.previous || null
            }
          });
        } else {
          savedEvent = await prisma.newsEvent.create({
            data: {
              title: event.title,
              titleEn: event.title,
              currency: event.country,
              impact: mappedImpact,
              forecast: event.forecast || null,
              actual: event.actual || null,
              previous: event.previous || null,
              eventTime: event.time,
              category: "Economic News",
              source: "Forex Factory",
              sourceUrl: "https://www.forexfactory.com/"
            }
          });
        }

        // If high impact news is newly released (actual value was filled), publish to Redis for realtime push
        if (mappedImpact === "HIGH" && event.actual && (!existing || !existing.actual) && this.redis) {
          await this.redis.publish("news:high_impact", JSON.stringify(savedEvent));
          console.log(`📢 Realtime push triggered for: ${event.title}`);
        }
      }

      console.log("Calendar synchronization completed successfully!");
    } catch (err: any) {
      console.error("Critical sync failure:", err.message);
    } finally {
      if (this.redis) {
        await this.redis.quit();
      }
    }
  }
}
