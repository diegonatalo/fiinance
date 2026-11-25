import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";

export const metadata: Metadata = {
  title: "Entrar | FIInance",
  description: "Entre na sua conta do FIInance para ver sua carteira de fundos imobiliários.",
  alternates: { canonical: "/entrar" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthScreen mode="sign-in" />;
}
