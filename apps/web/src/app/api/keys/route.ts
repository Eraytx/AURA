export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionUser } from "../../../lib/auth/session";
import { prisma } from "@aura/database";
import { handleApiError, ApiError } from "../../../lib/error";

// GET /api/keys - List user's active API keys
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "LÃ¼tfen giriÅŸ yapÄ±n.");
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id, revokedAt: null },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        usageCount: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: keys });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/keys - Generate a new API Key (invalidates prior ones)
export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req as any);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "LÃ¼tfen giriÅŸ yapÄ±n.");
    }

    const isPremium = user.role === "PREMIUM" || user.role === "ADMIN" || user.plan !== "FREE";
    if (!isPremium) {
      throw new ApiError(403, "FORBIDDEN", "API EriÅŸimi sadece Premium Ã¼yelerimize Ã¶zeldir.");
    }

    const body = await req.json().catch(() => ({}));
    const keyName = body.name || "Default API Key";

    // 1. Revoke existing keys
    await prisma.apiKey.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // 2. Generate raw secure key
    const rawUuid = crypto.randomUUID().replace(/-/g, "");
    const rawKey = `aura_${rawUuid}`;
    const keyPrefix = rawKey.substring(0, 12); // e.g. aura_abcdef12

    // 3. Hash the key with SHA-256 for secure storage
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        userId: user.id,
        key: hashedKey,
        keyPrefix,
        name: keyName,
      },
    });

    return NextResponse.json({
      data: {
        id: apiKeyRecord.id,
        name: apiKeyRecord.name,
        keyPrefix: apiKeyRecord.keyPrefix,
        rawKey, // Raw key is displayed ONLY ONCE to user
        createdAt: apiKeyRecord.createdAt,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

