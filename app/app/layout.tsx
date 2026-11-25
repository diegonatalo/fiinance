import { Suspense } from "react";
import type { Metadata } from "next";
import { AppLoading } from "@/components/app-loading";
import { SignedInApp } from "@/components/signed-in-app";

export const metadata: Metadata = { title: "Painel | FIInance", robots: { index: false, follow: false } };

// Todo o app depende da sessão, que só existe na requisição: não há casca
// estática para validar como navegação instantânea.
export const instant = false;

/**
 * O app (painel, carteira, proventos, calculadoras, conta) mora em `/app` e pede login;
 * a landing e as páginas legais ficam fora dele. A sessão é lida dentro do <Suspense>.
 */
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Suspense fallback={<AppLoading />}>
      <SignedInApp>{children}</SignedInApp>
    </Suspense>
  );
}
