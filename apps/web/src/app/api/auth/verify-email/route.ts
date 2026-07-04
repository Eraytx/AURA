export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "DoÄŸrulama belirteci eksik." }, { status: 400 });
    }

    const verification = await prisma.emailVerification.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "GeÃ§ersiz veya sÃ¼resi dolmuÅŸ doÄŸrulama belirteci." }, { status: 400 });
    }

    // Set emailVerified and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: verification.userId,
        action: "EMAIL_VERIFICATION_SUCCESS",
        entity: "User",
        entityId: verification.userId,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    // Check if client expects JSON or page view redirect
    const accept = req.headers.get("accept") || "";
    if (accept.includes("application/json")) {
      return NextResponse.json({ message: "E-posta baÅŸarÄ±yla doÄŸrulandÄ±." });
    }

    const host = req.headers.get("x-forwarded-host") || new URL(req.url).host;
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(`${origin}/login?verified=true`);
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json({ error: "E-posta doÄŸrulanÄ±rken bir hata oluÅŸtu." }, { status: 500 });
  }
}

