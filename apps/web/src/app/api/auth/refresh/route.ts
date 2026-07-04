export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "../../../../lib/auth/jwt";
import { prisma } from "@aura/database";

export async function POST(req: Request) {
  try {
    const cookiesHeader = req.headers.get("cookie") || "";
    const refreshToken = cookiesHeader
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("refresh-token="))
      ?.split("=")[1];

    if (!refreshToken) {
      return NextResponse.json({ error: "Yenileme belirteci bulunamadÄ±." }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "GeÃ§ersiz veya sÃ¼resi dolmuÅŸ belirteÃ§." }, { status: 401 });
    }

    // Verify session exists in DB
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || session.user.deletedAt !== null) {
      return NextResponse.json({ error: "Oturum sonlandÄ±rÄ±lmÄ±ÅŸ veya geÃ§ersiz." }, { status: 401 });
    }

    // Generate fresh Access Token
    const accessToken = await signAccessToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    return NextResponse.json({
      accessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return NextResponse.json({ error: "BelirteÃ§ yenileme sÄ±rasÄ±nda hata oluÅŸtu." }, { status: 500 });
  }
}

