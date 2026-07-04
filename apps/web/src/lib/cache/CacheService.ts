import { Redis } from "@upstash/redis";
import { env } from "../env";

export const TTL = {
  XAUUSD_PRICE: 30,          // 30 seconds
  NEWS_LIST: 5 * 60,         // 5 minutes
  NEWS_DETAIL: 15 * 60,      // 15 minutes
  NEWS_ANALYSIS: 60 * 60,    // 1 hour
  NEWS_HISTORY: 30 * 60,     // 30 minutes
  USER_SESSION: 15 * 60,     // 15 minutes
  USER_PLAN: 5 * 60,         // 5 minutes
  ADMIN_STATS: 60 * 60,      // 1 hour
  WEEKLY_FEED: 10 * 60,      // 10 minutes
} as const;

export const CacheKeys = {
  newsList: (filters: string) => `news:list:${filters}`,
  newsDetail: (id: string) => `news:detail:${id}`,
  newsAnalysis: (id: string) => `news:analysis:${id}`,
  newsHistory: (id: string, page: number) => `news:history:${id}:${page}`,
  newsWeekly: () => `news:weekly:current`,
  userSession: (userId: string) => `user:session:${userId}`,
  userPlan: (userId: string) => `user:plan:${userId}`,
  userFavorites: (userId: string) => `user:favorites:${userId}`,
  userApiUsage: (apiKey: string) => `api:usage:${apiKey}:today`,
  xauusdPrice: () => `market:xauusd:price`,
  dxyPrice: () => `market:dxy:price`,
  adminStats: () => `admin:stats:current`,
  adminUserCount: () => `admin:users:count`,
  rateLimit: (key: string) => `rl:${key}`,
};

class CacheServiceClass {
  private redis: Redis | null = null;

  constructor() {
    try {
      if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_URL !== "") {
        this.redis = new Redis({
          url: env.UPSTASH_REDIS_URL,
          token: env.UPSTASH_REDIS_TOKEN || "",
        });
      }
    } catch (err) {
      console.warn("⚠️ CacheService Upstash Redis connection failed. Operating in memory fallback mode.");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get<T>(key);
      return data;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.redis) return;
    try {
      if (ttl) {
        await this.redis.set(key, value, { ex: ttl });
      } else {
        await this.redis.set(key, value);
      }
    } catch {}
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch {}
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch {}
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;
    try {
      const count = await this.redis.exists(key);
      return count > 0;
    } catch {
      return false;
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    if (!this.redis) return 0;
    try {
      const val = await this.redis.incr(key);
      if (ttl && val === 1) {
        await this.redis.expire(key, ttl);
      }
      return val;
    } catch {
      return 0;
    }
  }

  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // Tag-based invalidation
  async tagSet(tags: string[], key: string, value: unknown, ttl: number): Promise<void> {
    if (!this.redis) return;
    try {
      await this.set(key, value, ttl);
      for (const tag of tags) {
        await this.redis.sadd(`tag:${tag}`, key);
        await this.redis.expire(`tag:${tag}`, ttl);
      }
    } catch {}
  }

  async invalidateTag(tag: string): Promise<void> {
    if (!this.redis) return;
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
      }
    } catch {}
  }

  // Stale-While-Revalidate pattern
  async swr<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    staleTtl: number
  ): Promise<{ data: T; isStale: boolean }> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      // Background revalidation
      this.getOrSet(key, fetcher, ttl + staleTtl).catch(() => {});
      return { data: cached, isStale: true };
    }
    const fresh = await fetcher();
    await this.set(key, fresh, ttl + staleTtl);
    return { data: fresh, isStale: false };
  }
}

export const CacheService = new CacheServiceClass();
