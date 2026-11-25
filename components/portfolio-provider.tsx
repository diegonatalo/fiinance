"use client";

import { useState, type ReactNode } from "react";
import { AccountContext, type Account } from "@/hooks/use-account";
import { usePortfolio, type Persistence } from "@/hooks/use-portfolio";
import { PortfolioContext } from "@/hooks/use-portfolio-context";
import * as actions from "@/lib/data/actions";
import type { AppData } from "@/types/fii";

/** As ações presas à conta da tela: com outra conta logada, o servidor recusa. */
const persistenceFor = (owner: string): Persistence => ({
  addAsset: (asset, buy) => actions.addAsset(owner, asset, buy),
  updateAsset: (asset) => actions.updateAsset(owner, asset),
  removeAsset: (id) => actions.removeAsset(owner, id),
  restoreAsset: (s) => actions.restoreAsset(owner, s.asset, s.transactions, s.payouts),
  recordOperation: (operation) => actions.recordOperation(owner, operation),
  removeTransaction: (id) => actions.removeTransaction(owner, id),
  addPayout: (payout) => actions.addPayout(owner, payout),
  removePayout: (id) => actions.removePayout(owner, id),
  setPaperTarget: (target) => actions.setPaperTarget(owner, target),
});

type PortfolioProviderProps = {
  initialData: AppData;
  account: Account;
  children: ReactNode;
};

/** A carteira chega do servidor já carregada; daqui em diante, cada mudança vai para o banco. */
export const PortfolioProvider = ({ initialData, account: initialAccount, children }: PortfolioProviderProps) => {
  // congelada junto com a carteira, que também só lê os dados iniciais uma vez
  const [account] = useState(initialAccount);
  const [persistence] = useState(() => persistenceFor(account.id));
  const portfolio = usePortfolio(initialData, persistence);
  return (
    <AccountContext value={account}>
      <PortfolioContext value={portfolio}>{children}</PortfolioContext>
    </AccountContext>
  );
};
