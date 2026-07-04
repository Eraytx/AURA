import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AURA XAUUSD - Gold News Impact Portal",
  description: "XAUUSD impact simulator and economic calendar tracker",
};

import { LocaleProvider } from "../components/LocaleProvider";
import { CookieBanner } from "../components/CookieBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${sans.variable} ${mono.variable} font-sans bg-background-primary text-text-primary`}>
        <LocaleProvider>
          {children}
          <CookieBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
