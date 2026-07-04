export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@aura/database";

export async function POST(req: Request) {
  try {
    const cookiesHeader = req.headers.get("cookie") || "";
    // Manual cookie parsing since NextRequest isn't used
    const refreshToken = cookiesHeader
      .split(";")
      .map(c => c.trim())
      .find(c => c.startsWith("refresh-token="))
      ?.split("=")[1];

    if (refreshToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: {
          refreshToken,
        },
      });
    }

    const response = NextResponse.json({ message: "Oturum baÅŸarÄ±yla kapatÄ±ldÄ±." });

    // Clear refresh-token cookie
    response.cookies.set("refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Ã‡Ä±kÄ±ÅŸ iÅŸlemi sÄ±rasÄ±nda bir hata oluÅŸtu." }, { status: 500 });
  }
}

