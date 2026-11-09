import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

const TITULO = "FIInance | Transforme dados em decisões";
const DESCRICAO =
  "Gerencie sua carteira de Fundos Imobiliários (FIIs) com gráficos e cálculos de alocação.";

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: TITULO,
  description: DESCRICAO,
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    siteName: "FIInance",
    locale: "pt_BR",
    title: TITULO,
    description: DESCRICAO,
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
    title: TITULO,
    description: DESCRICAO,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = { themeColor: "#10b981" };

// aplica o tema antes do primeiro paint, evitando flash de tema errado
const TEMA_ANTES_DO_PAINT = `
try {
  var t = JSON.parse(
    localStorage.getItem("fiinance:theme") ||
      localStorage.getItem("fii:theme") ||
      "null",
  );
  var dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // a classe "dark" é aplicada pelo script abaixo, antes da hidratação
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Script id="tema" strategy="beforeInteractive">
          {TEMA_ANTES_DO_PAINT}
        </Script>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
