import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "AURA XAUUSD Portal";
    const impact = searchParams.get("impact") || "HIGH";
    const forecast = searchParams.get("forecast") || "—";
    const currency = searchParams.get("currency") || "USD";

    const isHigh = impact === "HIGH";
    const badgeColor = isHigh ? "#E24B4A" : impact === "MEDIUM" ? "#E2A14A" : "#22C55E";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0D0D0D",
            color: "#F0EDE6",
            padding: "80px",
            fontFamily: "sans-serif",
            border: "6px solid #D4A017",
          }}
        >
          {/* Logo header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "36px", fontWeight: "bold", color: "#D4A017" }}>Au</span>
            <span style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "1px" }}>AURA XAUUSD</span>
          </div>

          {/* Event title & details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: badgeColor,
                  color: "#0D0D0D",
                  padding: "5px 12px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                {impact} IMPACT
              </span>
              <span style={{ fontSize: "20px", color: "#999890", fontWeight: "bold" }}>{currency}</span>
            </div>

            <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: 0, lineHeight: "1.2" }}>
              {title}
            </h1>
          </div>

          {/* Forecast preview */}
          <div style={{ display: "flex", gap: "40px", borderTop: "1px solid #1E1E1E", width: "100%", paddingTop: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ fontSize: "14px", color: "#999890", fontWeight: "bold", textTransform: "uppercase" }}>Beklenti (Forecast)</span>
              <span style={{ fontSize: "28px", fontWeight: "bold", color: "#D4A017" }}>{forecast}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ fontSize: "14px", color: "#999890", fontWeight: "bold", textTransform: "uppercase" }}>Hedef Varlık</span>
              <span style={{ fontSize: "28px", fontWeight: "bold" }}>XAUUSD Altın</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    return new Response(`Failed to generate image: ${err.message}`, { status: 500 });
  }
}
