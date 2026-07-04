export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "../../../../lib/auth/validation";
import { prisma } from "@aura/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (user) {
      // Create reset token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiration

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      const origin = req.headers.get("origin") || "http://localhost:3000";
      const resetLink = `${origin}/reset-password?token=${token}`;
      
      // Console mock print
      console.log(`[EMAIL SIMULATION] Password Reset Link for ${email}: ${resetLink}`);

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_REQUEST",
          entity: "User",
          entityId: user.id,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: "E-posta adresi sistemde kayÄ±tlÄ± ise ÅŸifre sÄ±fÄ±rlama baÄŸlantÄ±sÄ± gÃ¶nderilmiÅŸtir.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Åifre sÄ±fÄ±rlama isteÄŸi oluÅŸturulurken hata oluÅŸtu." }, { status: 500 });
  }
}

