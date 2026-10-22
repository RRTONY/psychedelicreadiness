import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://psychedelicreadiness.com";
const description =
  "39 plant medicines. 50+ readiness questions. 6 domains. An honest map of where you stand before you walk into territory that rewards preparation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Psychedelic Readiness Index", template: "%s" },
  description,
  applicationName: "Psychedelic Readiness Index",
  authors: [{ name: "Tony Greenberg", url: "https://tonygreenberg.com" }],
  openGraph: { type: "website", siteName: "Psychedelic Readiness Index", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Psychedelic Readiness Index",
  url: siteUrl,
  description,
  author: { "@type": "Person", name: "Tony Greenberg", url: "https://tonygreenberg.com" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmMono.variable} ${sourceSans3.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-pri-ink print:bg-white" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-9999 focus:rounded focus:bg-pri-purple focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to main content
        </a>
        <SiteChrome>
          <SiteHeader />
        </SiteChrome>
        <main id="main-content" className="flex-1 bg-background">
          {children}
        </main>
        <SiteChrome>
          <SiteFooter />
        </SiteChrome>
      </body>
    </html>
  );
}
