import type { Metadata } from "next";
import { PrivacyPage } from "@/components/legal-pages";

export const metadata: Metadata = {
  title: "Privacidade | FIInance",
  description: "O FIInance guarda a sua carteira só no seu navegador. Veja o que fica guardado e como apagar.",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return <PrivacyPage />;
}
