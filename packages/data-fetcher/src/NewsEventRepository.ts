import { prisma } from "@aura/database";
import { ForexFactoryEvent } from "./ForexFactoryClient";

export class NewsEventRepository {
  public static async findUpcoming(hours: number) {
    const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    return prisma.newsEvent.findMany({
      where: {
        createdAt: {
          lte: cutoff,
          gte: new Date(),
        },
      },
      include: {
        analyses: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  public static async findByDateRange(
    from: Date,
    to: Date,
    filters: { currency?: string; impact?: "LOW" | "MEDIUM" | "HIGH" } = {}
  ) {
    return prisma.newsEvent.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.impact && { impact: filters.impact }),
      },
      include: {
        analyses: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  public static async findHighImpact(limit = 10) {
    return prisma.newsEvent.findMany({
      where: {
        impact: "HIGH",
      },
      include: {
        analyses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  public static async findById(id: string) {
    return prisma.newsEvent.findUnique({
      where: { id },
      include: {
        analyses: true,
      },
    });
  }

  public static async upsertFromFeed(events: ForexFactoryEvent[]) {
    const results = [];
    for (const event of events) {
      const mappedImpact = event.impact.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
      
      const record = await prisma.newsEvent.findFirst({
        where: {
          title: event.title,
          eventTime: event.time,
        },
      });

      if (record) {
        const updated = await prisma.newsEvent.update({
          where: { id: record.id },
          data: {
            forecast: event.forecast || null,
            actual: event.actual || null,
            previous: event.previous || null,
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.newsEvent.create({
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
            sourceUrl: "https://www.forexfactory.com/",
          },
        });
        results.push(created);
      }
    }
    return results;
  }
}
