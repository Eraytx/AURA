export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { registerSchema } from "../../../../lib/auth/validation";
import { hashPassword } from "../../../../lib/auth/hash";
import { prisma } from "@aura/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // Check duplicate
    const existing = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
    if (existing) {
      return NextResponse.json({ error: "E-posta adresi zaten kullanÄ±mda." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const referralCode = "AURA-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "FREE",
        plan: "FREE",
        referralCode,
      },
    });

    // Create verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const verificationLink = `${origin}/verify-email?token=${token}`;
    
    // Output verification link for local simulation
    console.log(`[EMAIL SIMULATION] Verification Link for ${email}: ${verificationLink}`);

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        entity: "User",
        entityId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({
      message: "KayÄ±t baÅŸarÄ±lÄ±. E-posta doÄŸrulamasÄ± iÃ§in gelen kutunuzu veya konsolu kontrol edin.",
      userId: user.id,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "KayÄ±t iÅŸlemi sÄ±rasÄ±nda bir hata oluÅŸtu." }, { status: 500 });
  }
}

