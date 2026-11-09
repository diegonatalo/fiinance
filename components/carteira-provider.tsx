import type { ReactNode } from "react";
import { useCarteira } from "@/hooks/use-carteira";
import { CarteiraContext } from "@/lib/carteira-context";

export function CarteiraProvider({ children }: { children: ReactNode }) {
  const carteira = useCarteira();
  return <CarteiraContext value={carteira}>{children}</CarteiraContext>;
}
