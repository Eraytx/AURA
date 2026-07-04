import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database check...");

  // Check if seed has already run by counting NewsEvents
  const existingEventsCount = await prisma.newsEvent.count();
  if (existingEventsCount > 0) {
    console.log("Database already has data. Skipping seeding to prevent overwrite.");
    return;
  }

  console.log("Database is empty. Populating initial seed data...");

  // 1. Seed Admin User
  const adminPasswordHash = "$2a$12$KkQcO512Vv/P5G5d2tHjOuG7j12yN2fG6w10Z2H2N5L2G5f2Y4eGq";
  
  const admin = await prisma.user.create({
    data: {
      email: "admin@auraxauusd.com",
      emailVerified: new Date(),
      passwordHash: adminPasswordHash,
      name: "AURA Admin",
      role: "ADMIN",
      plan: "YEARLY",
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  // 2. Seed Sample News Events
  const cpi = await prisma.newsEvent.create({
    data: {
      title: "Tüketici Fiyat Endeksi (CPI) Aylık",
      titleEn: "Core CPI m/m",
      currency: "USD",
      impact: "HIGH",
      forecast: "0.2%",
      previous: "0.3%",
      eventTime: "15:30",
      category: "Inflation",
      source: "Bureau of Labor Statistics",
      sourceUrl: "https://www.bls.gov/cpi/",
    },
  });

  await prisma.newsAnalysis.create({
    data: {
      newsEventId: cpi.id,
      expectation: "Açıklanan enflasyon beklenti altı gelirse altın yükselir, aksi halde düşer.",
      sentiment: 65,
      sentimentLabel: "Bullish for Gold",
      aiImpactScore: 8.5,
      volatilityScore: 7.8,
      confidenceScore: 9.0,
      deviationAnalysis: "CPI verisindeki her -0.1% sapma altın fiyatında ortalama $15-20 yukarı yönlü hareketi tetikler.",
      historicalJson: JSON.stringify([
        { date: "10-06-2026", actual: "0.0%", forecast: "0.1%", change: "1.16%" },
        { date: "13-05-2026", actual: "0.3%", forecast: "0.3%", change: "0.17%" }
      ]),
    },
  });

  const nfp = await prisma.newsEvent.create({
    data: {
      title: "Tarım Dışı İstihdam (NFP)",
      titleEn: "Non-Farm Employment Change",
      currency: "USD",
      impact: "HIGH",
      forecast: "175K",
      previous: "165K",
      eventTime: "15:30",
      category: "Employment",
      source: "Bureau of Labor Statistics",
      sourceUrl: "https://www.bls.gov/ces/",
    },
  });

  await prisma.newsAnalysis.create({
    data: {
      newsEventId: nfp.id,
      expectation: "Zayıf istihdam Fed faiz indirimlerini hızlandırır, altına olumludur.",
      sentiment: 58,
      sentimentLabel: "Mildly Bullish for Gold",
      aiImpactScore: 9.2,
      volatilityScore: 8.5,
      confidenceScore: 8.8,
      deviationAnalysis: "Beklenti altı gelen istihdam verisi tahvil faizlerini aşağı çekerek altını destekler.",
      historicalJson: JSON.stringify([
        { date: "05-06-2026", actual: "218K", forecast: "175K", change: "-1.15%" },
        { date: "08-05-2026", actual: "160K", forecast: "185K", change: "1.43%" }
      ]),
    },
  });

  const fomc = await prisma.newsEvent.create({
    data: {
      title: "Fed Faiz Kararı ve Basın Toplantısı",
      titleEn: "FOMC Press Conference",
      currency: "USD",
      impact: "HIGH",
      forecast: "5.50%",
      previous: "5.50%",
      eventTime: "21:00",
      category: "Interest Rate",
      source: "Federal Reserve",
      sourceUrl: "https://www.federalreserve.gov/",
    },
  });

  await prisma.newsAnalysis.create({
    data: {
      newsEventId: fomc.id,
      expectation: "Faiz indirimi ve güvercin Powell altını yükseltir.",
      sentiment: 72,
      sentimentLabel: "Highly Bullish for Gold",
      aiImpactScore: 9.8,
      volatilityScore: 9.5,
      confidenceScore: 9.2,
      deviationAnalysis: "Faizlerin sabit tutulması ancak güvercin tonlu açıklamalar altını yukarı taşır.",
      historicalJson: JSON.stringify([
        { date: "17-06-2026", actual: "5.50%", forecast: "5.50%", change: "1.08%" },
        { date: "29-04-2026", actual: "5.50%", forecast: "5.50%", change: "-0.95%" }
      ]),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
