"use client";

import type { ReactNode } from "react";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { ToastProvider } from "@/components/toast-provider";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ToastProvider>
      <PortfolioProvider>{children}</PortfolioProvider>
    </ToastProvider>
  );
};
