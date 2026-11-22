import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio-page";

export const metadata: Metadata = { alternates: { canonical: "/app/carteira" } };

export default function Page() {
  return <PortfolioPage />;
}
