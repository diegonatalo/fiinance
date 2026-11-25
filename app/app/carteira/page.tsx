import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio-page";

export const metadata: Metadata = { alternates: { canonical: "/app/carteira" } };

// página logada: depende da sessão (ver app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <PortfolioPage />;
}
