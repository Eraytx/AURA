import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider.toUpperCase();
  const validProviders = ["GOOGLE", "GITHUB", "DISCORD"];

  if (!validProviders.includes(provider)) {
    return NextResponse.json({ error: "Desteklenmeyen OAuth sağlayıcısı." }, { status: 400 });
  }

  // Generate OAuth redirect mock URL
  // Redirecting straight back to our local callback with mock parameters to simulate completed login flow!
  const origin = new URL(req.url).origin;
  const mockCode = `mock_code_${Math.random().toString(36).substring(7)}`;
  const callbackUrl = `${origin}/api/auth/oauth/${params.provider}/callback?code=${mockCode}&state=aura_state`;

  return NextResponse.redirect(callbackUrl);
}
