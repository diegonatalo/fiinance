import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard-page";

export const metadata: Metadata = { alternates: { canonical: "/app" } };

// página logada: depende da sessão (ver app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <DashboardPage />;
}
