import { createContext, useContext } from "react";

/** A pessoa logada, como aparece no app (nunca a sessão em si). */
export type Account = { id: string; name: string; email: string };

export const AccountContext = createContext<Account | null>(null);

export function useAccount(): Account {
  const account = useContext(AccountContext);
  if (!account) throw new Error("useAccount deve ser usado dentro de PortfolioProvider");
  return account;
}
