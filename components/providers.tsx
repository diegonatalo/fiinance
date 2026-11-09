"use client";

import type { ReactNode } from "react";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { ToastProvider } from "@/components/toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PortfolioProvider>{children}</PortfolioProvider>
    </ToastProvider>
  );
}
