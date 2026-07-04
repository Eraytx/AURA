export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { registerSchema } from "../../../../lib/auth/validation";
import { hashPassword } from "../../../../lib/auth/hash";
import { signAccessToken, signRefreshToken } from "../../../../lib/auth/jwt";
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
      where: { email, deletedAt: null },
    });
    if (existing) {
      return NextResponse.json({ error: "E-posta adresi zaten kullanımda." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const referralCode = "AURA-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Auto-verify email (no real email service configured — verification skipped for test phase)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "FREE",
        plan: "FREE",
        referralCode,
        emailVerified: new Date(), // Auto-verify immediately
      },
    });

    // Create session immediately so user can login right away
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers.get("user-agent") || "",
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        expiresAt,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        entity: "User",
        entityId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    const response = NextResponse.json({
      message: "Kayıt başarılı. Giriş yapabilirsiniz.",
      userId: user.id,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    });

    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Kayıt işlemi sırasında bir hata oluştu." }, { status: 500 });
  }
}
