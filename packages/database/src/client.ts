import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const client = new PrismaClient();

client.$use(async (params: any, next: (params: any) => Promise<any>) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`⚠️ [Slow Query] Model: ${params.model}, Action: ${params.action}, Duration: ${duration}ms`);
  }
  return result;
});

export const prisma = global.prisma || client;

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export * from "@prisma/client";
