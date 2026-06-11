import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const SITE_URL = "https://onfable.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "onfable — the open-source AI agent that lives in your terminal",
    template: "%s · onfable",
  },
  description:
    "onfable is an open-source autonomous AI agent for your own machine. It runs commands, edits files, browses the web, and remembers you. One-line install for macOS, Linux, and Windows. Works with Claude, OpenAI, OpenRouter, or any model.",
  keywords: [
    "AI agent",
    "autonomous agent",
    "CLI",
    "open source",
    "Claude",
    "OpenAI",
    "terminal assistant",
  ],
  openGraph: {
    title: "onfable — your machine. your agent. your story.",
    description:
      "The open-source autonomous AI agent that lives in your terminal. Runs commands, edits files, browses the web, and remembers you.",
    url: SITE_URL,
    siteName: "onfable",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@onfable",
    creator: "@onfable",
    title: "onfable — the open-source AI agent in your terminal",
    description:
      "Runs commands, edits files, browses the web, and remembers you. One-line install. Any model.",
  },
  robots: { index: true, follow: true },
  other: {
    "virtual-protocol-site-verification": "dfd5350256edc189184b290057022609",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "onfable",
  operatingSystem: "macOS, Linux, Windows",
  applicationCategory: "DeveloperApplication",
  description:
    "Open-source autonomous AI agent for your terminal. Runs commands, edits files, browses the web, and remembers you.",
  url: SITE_URL,
  sameAs: ["https://github.com/onfable/onfable", "https://x.com/onfable"],
  license: "https://opensource.org/license/mit",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-[family-name:var(--font-geist)] bg-black text-white">
        {/* Splash: inline SVG + CSS-only animation, shown before hydration */}
        <div id="splash" aria-hidden="true">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="16" y1="5" x2="16" y2="27" />
            <line x1="5" y1="16" x2="27" y2="16" />
            <line x1="8.2" y1="8.2" x2="23.8" y2="23.8" />
            <line x1="23.8" y1="8.2" x2="8.2" y2="23.8" />
          </svg>
        </div>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
