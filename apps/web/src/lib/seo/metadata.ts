import type { Metadata } from "next";

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
}

export function generateMetadata(page: PageMetadata): Metadata {
  const defaultOgImage = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/og?title=${encodeURIComponent(page.title)}`;

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords.join(", "),
    alternates: {
      canonical: page.canonicalUrl || undefined,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: page.ogType || "website",
      images: [
        {
          url: page.ogImage || defaultOgImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [page.ogImage || defaultOgImage],
    },
    robots: page.noIndex ? "noindex, nofollow" : "index, follow",
    other: page.structuredData
      ? {
          "structured-data": JSON.stringify(page.structuredData),
        }
      : {},
  };
}
