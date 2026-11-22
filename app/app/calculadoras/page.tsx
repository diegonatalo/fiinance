import type { Metadata } from "next";
import { CalculatorsPage } from "@/components/calculators-page";

export const metadata: Metadata = { alternates: { canonical: "/app/calculadoras" } };

export default function Page() {
  return <CalculatorsPage />;
}
