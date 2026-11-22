import type { Metadata } from "next";
import { PayoutsPage } from "@/components/payouts-page";

export const metadata: Metadata = { alternates: { canonical: "/app/proventos" } };

export default function Page() {
  return <PayoutsPage />;
}
