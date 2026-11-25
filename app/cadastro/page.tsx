import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";

export const metadata: Metadata = {
  title: "Criar conta | FIInance",
  description: "Crie sua conta grátis no FIInance e acompanhe sua carteira de FIIs em qualquer aparelho.",
  alternates: { canonical: "/cadastro" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthScreen mode="sign-up" />;
}
