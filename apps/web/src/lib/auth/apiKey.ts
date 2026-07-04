import crypto from "crypto";
import { prisma } from "@aura/database";
import { ApiError } from "../error";

export async function validateApiKey(req: Request) {
  const apiKeyHeader = req.headers.get("X-API-Key") || "";
  if (!apiKeyHeader || !apiKeyHeader.startsWith("aura_")) {
    throw new ApiError(401, "UNAUTHORIZED", "Geçersiz veya eksik X-API-Key başlığı.");
  }

  const hashedKey = crypto.createHash("sha256").update(apiKeyHeader).digest("hex");
  
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: { user: true },
  });

  if (!apiKeyRecord || apiKeyRecord.revokedAt) {
    throw new ApiError(401, "UNAUTHORIZED", "API Anahtarı bulunamadı veya iptal edilmiş.");
  }

  // Increment API usage stats
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return apiKeyRecord.user;
}
