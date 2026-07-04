export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { resetPasswordSchema } from "../../../../lib/auth/validation";
import { hashPassword } from "../../../../lib/auth/hash";
import { prisma } from "@aura/database";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { token, password } = parsed.data;

    // Retrieve active token
    const record = await prisma.passwordReset.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "GeÃ§ersiz veya sÃ¼resi dolmuÅŸ sÄ±fÄ±rlama kodu." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Update user password and clear token in transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: record.userId,
        action: "PASSWORD_RESET_SUCCESS",
        entity: "User",
        entityId: record.userId,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({
      message: "Åifreniz baÅŸarÄ±yla sÄ±fÄ±rlandÄ±. Yeni ÅŸifrenizle giriÅŸ yapabilirsiniz.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Åifre sÄ±fÄ±rlanÄ±rken bir hata oluÅŸtu." }, { status: 500 });
  }
}

