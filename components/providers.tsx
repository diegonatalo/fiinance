"use client";

import type { ReactNode } from "react";
import { PortfolioProvider } from "@/components/portfolio-provider";
import { ToastProvider } from "@/components/toast-provider";
import type { Account } from "@/hooks/use-account";
import type { AppData } from "@/types/fii";

type ProvidersProps = {
  initialData: AppData;
  account: Account;
  children: ReactNode;
};

export const Providers = ({ initialData, account, children }: ProvidersProps) => {
  return (
    <ToastProvider>
      <PortfolioProvider initialData={initialData} account={account}>
        {children}
      </PortfolioProvider>
    </ToastProvider>
  );
};
