import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, THEME_COLORS } from "@/lib/site";
import { THEME_KEY } from "@/lib/storage-keys";
import { themeScript } from "@/lib/theme";

const geist = Geist({ subsets: ["latin"], variable: "--nf-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--nf-geist-mono", display: "swap" });

const TITLE = "FIInance | Sua carteira de FIIs em papel e tijolo";

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
        alt: "FIInance: sua carteira de FIIs em papel e tijolo",
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

export const viewport: Viewport = { themeColor: THEME_COLORS.dark };


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // a classe "dark" é aplicada pelo script abaixo, antes da hidratação
    <html lang="pt-BR" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <Script id="tema" strategy="beforeInteractive">
          {themeScript(THEME_KEY, THEME_COLORS)}
        </Script>
        {children}
      </body>
    </html>
  );
}
