import type { ReactNode } from "react";
import { useCarteira } from "../hooks/useCarteira";
import { CarteiraContext } from "./carteira-context";

export function CarteiraProvider({ children }: { children: ReactNode }) {
  const carteira = useCarteira();
  return <CarteiraContext value={carteira}>{children}</CarteiraContext>;
}
