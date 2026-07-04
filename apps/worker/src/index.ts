import { Worker, Job } from "bullmq";
import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development"
    ? {
        target: "pino-pretty",
        options: { colorize: true },
      }
    : undefined,
});

logger.info("⚡ AURA Worker process starting up...");

const redisUrl = process.env.UPSTASH_REDIS_URL || "redis://localhost:6379";
const connectionConfig = {
  connection: {
    url: redisUrl,
  },
};

// 1. news-fetch worker
const newsFetchWorker = new Worker(
  "news-fetch",
  async (job: Job) => {
    logger.info({ jobId: job.id }, "Executing news-fetch job: crawling latest Forex Factory calendar...");
    // Mock fetch logic
    return { fetched: 12, skipped: 5 };
  },
  { ...connectionConfig, concurrency: 1 }
);

// 2. news-analysis worker
const newsAnalysisWorker = new Worker(
  "news-analysis",
  async (job: Job) => {
    const { newsId } = job.data;
    logger.info({ jobId: job.id, newsId }, "Executing news-analysis job: running Claude API engine...");
    return { analysisId: "mock-analysis-result" };
  },
  { ...connectionConfig, concurrency: 3 }
);

// 3. email worker
const emailWorker = new Worker(
  "email",
  async (job: Job) => {
    const { to, template, subject } = job.data;
    logger.info({ jobId: job.id, to, template }, `Executing email job: sending ${subject}...`);
    return { sent: true };
  },
  { ...connectionConfig, concurrency: 10 }
);

// 4. notification worker
const notificationWorker = new Worker(
  "notification",
  async (job: Job) => {
    logger.info({ jobId: job.id }, "Executing notification job: distributing high impact push alerts...");
    return { dispatchedCount: 145 };
  },
  { ...connectionConfig, concurrency: 5 }
);

// 5. cleanup worker
const cleanupWorker = new Worker(
  "cleanup",
  async (job: Job) => {
    logger.info({ jobId: job.id }, "Executing night cleanup task: deleting old sessions & archiving logs...");
    return { archivedLogs: 84, cleanedSessions: 12 };
  },
  { ...connectionConfig, concurrency: 1 }
);

// 6. export worker
const exportWorker = new Worker(
  "export",
  async (job: Job) => {
    logger.info({ jobId: job.id }, "Executing export job: generating historical reaction CSV archive...");
    return { fileUrl: "s3://aura-backups/exports/sample.csv" };
  },
  { ...connectionConfig, concurrency: 2 }
);

// 7. referral worker
const referralWorker = new Worker(
  "referral",
  async (job: Job) => {
    logger.info({ jobId: job.id }, "Executing referral reward credit task...");
    return { referralRewarded: true };
  },
  { ...connectionConfig, concurrency: 5 }
);

// Logging error handlers
const workers = [
  { name: "news-fetch", instance: newsFetchWorker },
  { name: "news-analysis", instance: newsAnalysisWorker },
  { name: "email", instance: emailWorker },
  { name: "notification", instance: notificationWorker },
  { name: "cleanup", instance: cleanupWorker },
  { name: "export", instance: exportWorker },
  { name: "referral", instance: referralWorker },
];

workers.forEach(({ name, instance }) => {
  instance.on("completed", (job) => {
    logger.info({ worker: name, jobId: job.id }, `Job completed successfully!`);
  });

  instance.on("failed", (job, err) => {
    logger.error({ worker: name, jobId: job?.id, error: err.message }, `Job execution failed!`);
  });
});

// Graceful Shutdown
async function shutdown(signal: string) {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);
  
  await Promise.all(
    workers.map(async ({ name, instance }) => {
      logger.info(`Stopping worker: ${name}...`);
      await instance.close();
    })
  );

  logger.info("👋 Worker shutdown complete. Exiting process.");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
