import { Queue } from "bullmq";
import { env } from "../lib/env";

const connectionConfig = {
  connection: {
    url: env.UPSTASH_REDIS_URL || "redis://localhost:6379",
  },
};

export const Queues = {
  NEWS_FETCH: new Queue("news-fetch", connectionConfig),
  NEWS_ANALYSIS: new Queue("news-analysis", connectionConfig),
  EMAIL: new Queue("email", connectionConfig),
  NOTIFICATION: new Queue("notification", connectionConfig),
  CLEANUP: new Queue("cleanup", connectionConfig),
  EXPORT: new Queue("export", connectionConfig),
  REFERRAL: new Queue("referral", connectionConfig),
} as const;

export async function addJob(queueName: keyof typeof Queues, jobName: string, data: any, opts: any = {}) {
  const queue = Queues[queueName];
  try {
    await queue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
      ...opts,
    });
  } catch (err) {
    console.error(`Failed to add job to queue ${queueName}:`, err);
  }
}
