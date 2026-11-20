import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

export const metadata: Metadata = { title: "Painel | FIInance" };

/** O app (painel, carteira, proventos, calculadoras) mora em `/app`; a landing fica em `/`. */
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
