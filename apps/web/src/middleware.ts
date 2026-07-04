import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth/jwt";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "./lib/env";

let ratelimit: Ratelimit | null = null;

try {
  const isLocalhost = env.UPSTASH_REDIS_URL.includes("localhost") || env.UPSTASH_REDIS_URL.includes("127.0.0.1");
  const isProd = process.env.NODE_ENV === "production";

  if (env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_URL !== "" && (!isProd || !isLocalhost)) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN || "",
    });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
    });
  }
} catch (err) {
  console.warn("⚠️ Upstash Redis rate limiting initialization skipped. Using local mode.");
}

const LOCALES = ["tr", "en"];
const DEFAULT_LOCALE = "tr";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const ip = request.ip || "127.0.0.1";

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/api/og") // exclude OG image generation API
  ) {
    return NextResponse.next();
  }

  // 1. Rate Limiting for API routes
  if (pathname.startsWith("/api") && ratelimit) {
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    } catch (err) {
      console.error("Rate limiting execution error:", err);
    }
  }

  // 2. Localization Redirect & Rewrite checks
  const pathParts = pathname.split("/");
  const localeSegment = pathParts[1];
  const hasLocale = LOCALES.includes(localeSegment);

  if (!hasLocale) {
    // Determine language: cookie or Accept-Language header
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    let preferredLocale = cookieLocale || DEFAULT_LOCALE;

    if (!cookieLocale) {
      const acceptLang = request.headers.get("accept-language") || "";
      if (acceptLang.toLowerCase().startsWith("en")) {
        preferredLocale = "en";
      }
    }

    // Redirect to locale-prefixed URL
    const targetUrl = new URL(`/${preferredLocale}${pathname}${search}`, request.url);
    return NextResponse.redirect(targetUrl);
  }

  // Has locale prefix - extract and compute core path
  const locale = localeSegment;
  const strippedPath = "/" + pathParts.slice(2).join("/");

  // 3. Auth Route Protection based on strippedPath
  const authHeader = request.headers.get("authorization");
  const refreshTokenCookie = request.cookies.get("refresh-token")?.value;

  let userPayload = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) {
      userPayload = await verifyAccessToken(token);
    }
  }

  const isProtectedRoute = strippedPath.startsWith("/dashboard") || strippedPath.startsWith("/api/premium");
  const isAdminRoute = strippedPath.startsWith("/api/admin") || strippedPath.startsWith("/admin");

  if (isProtectedRoute && !userPayload && !refreshTokenCookie) {
    if (strippedPath.startsWith("/api")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    // Redirect to login page in corresponding language
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAdminRoute) {
    if (!userPayload || userPayload.role !== "ADMIN") {
      if (strippedPath.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ error: "Forbidden: Admin access required" }), { status: 403 });
      }
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // 4. Security Headers and standard CSP
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://query1.finance.yahoo.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://api.stripe.com https://query1.finance.yahoo.com;
  `.replace(/\s{2,}/g, " ").trim();

  // Rewrite internally to the core Next.js page (e.g. /tr/dashboard -> /dashboard)
  const rewriteUrl = new URL(`${strippedPath}${search}`, request.url);
  const response = NextResponse.rewrite(rewriteUrl);
  
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("x-locale", locale); // Pass locale header to components
  
  // Set NEXT_LOCALE cookie to keep language persisted for 30 days
  response.cookies.set("NEXT_LOCALE", locale, { maxAge: 30 * 24 * 60 * 60, path: "/" });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (core api endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt (search engines)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    "/api/premium/:path*",
    "/api/admin/:path*",
    "/api/auth/((?!oauth).*)",
  ],
};
