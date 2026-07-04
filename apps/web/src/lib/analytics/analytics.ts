export type AnalyticsEvent =
  | { name: "page_view"; props: { path: string } }
  | { name: "news_viewed"; props: { newsId: string; impact: string } }
  | { name: "analysis_expanded"; props: { newsId: string } }
  | { name: "simulator_used"; props: { newsId: string } }
  | { name: "upgrade_clicked"; props: { source: string; plan: string } }
  | { name: "checkout_started"; props: { plan: string; amount: number } }
  | { name: "purchase_completed"; props: { plan: string; revenue: number } }
  | { name: "favorite_added"; props: { newsId: string } }
  | { name: "csv_exported"; props: { rowCount: number } }
  | { name: "api_key_created" }
  | { name: "language_changed"; props: { from: string; to: string } }
  | { name: "web_vital"; props: { metric: any } };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  // GDPR Consent Check
  try {
    const consentRaw = localStorage.getItem("cookie_consent");
    const consent = consentRaw ? JSON.parse(consentRaw) : null;
    
    // If user has not accepted analytics cookie tracking, ignore GA4 push
    if (!consent || !consent.analytics) {
      console.log(`🔒 [ANALYTICS BLOCKED - GDPR] Event: ${event.name}`);
      return;
    }
  } catch {
    // block on read error
    return;
  }

  // GA4 dataLayer push mock
  const dataLayer = (window as any).dataLayer || [];
  dataLayer.push({
    event: event.name,
    ...("props" in event ? event.props : {}),
  });
  (window as any).dataLayer = dataLayer;

  console.log(`📊 [GA4 EVENT TRACED] Name: ${event.name}`, "props" in event ? event.props : "");
}
