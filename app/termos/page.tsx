import type { Metadata } from "next";
import { TermsPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Termos de uso | FIInance",
  description: "As regras para usar o FIInance. Não é recomendação de investimento.",
  alternates: { canonical: "/termos" },
};

export default function Page() {
  return <TermsPage />;
}
