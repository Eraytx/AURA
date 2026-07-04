// Sentry Client Config Mock for local development compiles
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || "https://mock@sentry.io/123456",
  tracesSampleRate: 1.0,
  debug: false,
});
