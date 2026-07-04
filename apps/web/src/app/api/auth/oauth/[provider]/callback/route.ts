import { NextResponse } from "next/server";
import { prisma } from "@aura/database";
import { signAccessToken, signRefreshToken } from "../../../../../../lib/auth/jwt";

export async function GET(
  req: Request,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider.toUpperCase() as "GOOGLE" | "GITHUB" | "DISCORD";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "OAuth authorization code missing." }, { status: 400 });
  }

  try {
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Simulate fetching user details from provider APIs
    const mockEmail = `oauth_${params.provider}_user@gmail.com`;
    const mockName = `OAuth ${params.provider} User`;
    const providerAccountId = `id_${Math.random().toString(36).substring(2)}`;

    // Match or create User
    let user = await prisma.user.findFirst({
      where: { email: mockEmail, deletedAt: null },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: mockEmail,
          emailVerified: new Date(),
          name: mockName,
          role: "FREE",
          plan: "FREE",
        },
      });
    }

    // Link OAuthAccount in database
    await prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      update: {
        accessToken: "mock_access_token",
      },
      create: {
        userId: user.id,
        provider,
        providerAccountId,
        accessToken: "mock_access_token",
      },
    });

    // Create session and set cookie
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers.get("user-agent") || "",
        ipAddress,
        expiresAt,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `OAUTH_LOGIN_${provider}`,
        entity: "User",
        entityId: user.id,
        ipAddress,
      },
    });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    
    // Set refresh token cookie
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    // Store Access Token in transient cookie for client reading (optional)
    response.cookies.set("access-token", accessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.json({ error: "OAuth giriş işlemi tamamlanamadı." }, { status: 500 });
  }
}
