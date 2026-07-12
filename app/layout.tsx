import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  icons: { icon: "/brand/iuoc-logo-light@3x.png" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
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
        className={`${fraunces.variable} ${hankenGrotesk.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
