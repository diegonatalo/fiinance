import { createContext, useContext } from "react";
import type { Carteira } from "../hooks/useCarteira";

export const CarteiraContext = createContext<Carteira | null>(null);

export function useCarteiraContext(): Carteira {
  const ctx = useContext(CarteiraContext);
  if (!ctx) {
    throw new Error("useCarteiraContext deve ser usado dentro de CarteiraProvider");
  }
  return ctx;
}
