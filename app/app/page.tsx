import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard-page";

export const metadata: Metadata = { alternates: { canonical: "/app" } };

export default function Page() {
  return <DashboardPage />;
}
