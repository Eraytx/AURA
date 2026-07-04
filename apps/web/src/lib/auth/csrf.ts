import { NextRequest, NextResponse } from "next/server";

export function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateCsrf(req: NextRequest): boolean {
  // Safe methods do not require CSRF validation
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  const cookieToken = req.cookies.get("csrf-token")?.value;
  const headerToken = req.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

export function setCsrfCookie(res: NextResponse, token: string) {
  res.cookies.set("csrf-token", token, {
    httpOnly: false, // client JS reads this to place in the header for mutation requests
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}
