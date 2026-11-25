import type { Metadata } from "next";
import { PayoutsPage } from "@/components/payouts-page";

export const metadata: Metadata = { alternates: { canonical: "/app/proventos" } };

// página logada: depende da sessão (ver app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <PayoutsPage />;
}
