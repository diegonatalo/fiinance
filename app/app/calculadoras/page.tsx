import type { Metadata } from "next";
import { CalculatorsPage } from "@/components/calculators-page";

export const metadata: Metadata = { alternates: { canonical: "/app/calculadoras" } };

// página logada: depende da sessão (ver app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <CalculatorsPage />;
}
