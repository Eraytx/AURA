export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth/session";

export async function GET(req: Request) {
  try {
    // getSessionUser expects NextRequest, cast Request to get compatibility
    const user = await getSessionUser(req as any);

    if (!user) {
      return NextResponse.json({ error: "Oturum bulunamadÄ± veya yetkisiz eriÅŸim." }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("Get current user error:", err);
    return NextResponse.json({ error: "KullanÄ±cÄ± bilgileri alÄ±nÄ±rken hata oluÅŸtu." }, { status: 500 });
  }
}

