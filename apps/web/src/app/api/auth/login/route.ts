export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { loginSchema } from "../../../../lib/auth/validation";
import { verifyPassword } from "../../../../lib/auth/hash";
import { signAccessToken, signRefreshToken } from "../../../../lib/auth/jwt";
import { prisma } from "@aura/database";

export async function POST(req: Request) {
  const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
  
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // 1. Check Rate Limit (5 failed attempts in past 15 minutes)
    const failedAttempts = await prisma.auditLog.count({
      where: {
        action: "LOGIN_FAILED",
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
    });

    if (failedAttempts >= 5) {
      return NextResponse.json(
        { error: "Ã‡ok fazla baÅŸarÄ±sÄ±z deneme yaptÄ±nÄ±z. HesabÄ±nÄ±z 15 dakika boyunca askÄ±ya alÄ±nmÄ±ÅŸtÄ±r." },
        { status: 429 }
      );
    }

    // 2. Query User
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user || !user.passwordHash) {
      // Create Audit Log of failure
      await prisma.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entity: "User",
          ipAddress,
        },
      });
      return NextResponse.json({ error: "GeÃ§ersiz e-posta veya ÅŸifre." }, { status: 401 });
    }

    // 3. Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      // Create Audit Log of failure
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          entity: "User",
          entityId: user.id,
          ipAddress,
        },
      });
      return NextResponse.json({ error: "GeÃ§ersiz e-posta veya ÅŸifre." }, { status: 401 });
    }

    // 4. Check if Email is Verified
    if (!user.emailVerified) {
      return NextResponse.json({ error: "LÃ¼tfen e-posta adresinizi doÄŸrulayÄ±n." }, { status: 403 });
    }

    // 5. Generate Session and Tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken(user.id);

    // Save refresh token to session table
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken, // normally stored hashed, storing raw for match lookup, or standard hash verification
        userAgent: req.headers.get("user-agent") || "",
        ipAddress,
        expiresAt,
      },
    });

    // Create Audit Log of success
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entity: "User",
        entityId: user.id,
        ipAddress,
      },
    });

    const response = NextResponse.json({
      message: "GiriÅŸ baÅŸarÄ±lÄ±.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    });

    // Set refresh token in HttpOnly cookie
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "GiriÅŸ iÅŸlemi sÄ±rasÄ±nda bir hata oluÅŸtu." }, { status: 500 });
  }
}

