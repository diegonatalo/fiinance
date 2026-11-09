"use client";

import type { ReactNode } from "react";
import { CarteiraProvider } from "@/components/carteira-provider";
import { ToastProvider } from "@/components/toast-provider";
import { migrarLegado } from "@/lib/migracao";

// Converte dados antigos do localStorage antes do primeiro render no navegador.
if (typeof window !== "undefined") migrarLegado();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CarteiraProvider>{children}</CarteiraProvider>
    </ToastProvider>
  );
}
