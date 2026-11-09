"use client";

import type { ReactNode } from "react";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { ToastProvider } from "@/components/toast-provider";
import { migrateLegacy } from "@/lib/migration";

// Converte dados antigos do localStorage antes do primeiro render no navegador.
if (typeof window !== "undefined") migrateLegacy();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PortfolioProvider>{children}</PortfolioProvider>
    </ToastProvider>
  );
}
