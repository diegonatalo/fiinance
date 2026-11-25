import type { Metadata } from "next";
import { AccountPage } from "@/components/account-page";

export const metadata: Metadata = { title: "Conta | FIInance" };

// página logada: depende da sessão (ver app/app/layout.tsx)
export const instant = false;

export default function Page() {
  return <AccountPage />;
}
