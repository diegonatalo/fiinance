import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { THEME_KEY } from "@/lib/storage-keys";
import { themeScript } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--nf-inter", display: "swap" });

const TITLE = "FIInance | Transforme dados em decisões";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: SITE_DESCRIPTION,
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "pt_BR",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FIInance: transforme dados em decisões",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = { themeColor: "#10b981" };


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // a classe "dark" é aplicada pelo script abaixo, antes da hidratação
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body>
        <Script id="tema" strategy="beforeInteractive">
          {themeScript(THEME_KEY)}
        </Script>
        {children}
      </body>
    </html>
  );
}
