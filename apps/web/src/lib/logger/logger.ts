import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: "aura-web",
    env: process.env.NODE_ENV,
  },
});

// Structural logging interface
export function logRequest(method: string, url: string, status: number, duration: number, ip: string) {
  logger.info({
    method,
    url,
    status,
    durationMs: duration,
    ipAddress: ip,
  }, `HTTP ${method} ${url} completed with ${status} in ${duration}ms`);
}
