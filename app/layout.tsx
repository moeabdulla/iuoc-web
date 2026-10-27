import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Amiri } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// The workhorse book serif: display and body, upright and italic.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

// Reserved for the Arabic glyphs (basmala, salawat) so they render with
// proper calligraphic weight. Arabic subset only — no Latin duplication.
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  icons: { icon: "/brand/iuoc-emblem.png" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#082f26",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` only affects the html tag, and is needed by
    // `ThemeProvider` which sets the theme class attribute on it.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSerif.variable} ${amiri.variable} flex min-h-dvh flex-col font-serif antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ConvexClientProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
