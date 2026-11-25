import { useMemo, useRef, useState } from "react";
import { uid } from "@/lib/id";
import { calculatePositions } from "@/lib/position";
import { calculateSummary } from "@/lib/summary";
import type { Asset, AppData, Payout, Transaction, OperationType } from "@/types/fii";

export type NewAsset = Omit<Asset, "id">;

export type NewOperation = {
  type: OperationType;
  date: string;
  shares: number;
  price: number;
};

export type NewPayout = {
  assetId: string;
  date: string;
  valuePerShare: number;
  shares: number;
};

/** Tudo o que pertence a um ativo, para permitir "desfazer" a exclusão. */
export type AssetSnapshot = {
  asset: Asset;
  transactions: Transaction[];
  payouts: Payout[];
};

/** Onde cada mudança é gravada (as Server Actions, presas à conta da tela). */
export type Persistence = {
  addAsset: (asset: Asset, buy: Transaction) => Promise<unknown>;
  updateAsset: (asset: Asset) => Promise<unknown>;
  removeAsset: (id: string) => Promise<unknown>;
  restoreAsset: (snapshot: AssetSnapshot) => Promise<unknown>;
  recordOperation: (operation: Transaction) => Promise<unknown>;
  removeTransaction: (id: string) => Promise<unknown>;
  addPayout: (payout: Payout) => Promise<unknown>;
  removePayout: (id: string) => Promise<unknown>;
  setPaperTarget: (target: number | null) => Promise<unknown>;
};

export const SAVE_ERROR = "Não foi possível salvar a última mudança. Recarregue a página para ver o que ficou salvo.";

/**
 * A carteira na tela. Cada mudança aparece na hora e é gravada em segundo plano,
 * uma de cada vez e na ordem em que aconteceu (a compra só depois do fundo).
 */
export function usePortfolio(initialData: AppData, persistence: Persistence) {
  const [data, setData] = useState<AppData>(initialData);
  const [pending, setPending] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());

  const assets = useMemo(() => calculatePositions(data.assets, data.transactions), [data.assets, data.transactions]);
  const summary = useMemo(() => calculateSummary(assets), [assets]);

  function persist(run: () => Promise<unknown>) {
    setPending((n) => n + 1);
    queue.current = queue.current
      .then(run)
      .then(
        () => undefined,
        () => setSaveError(SAVE_ERROR),
      )
      .finally(() => setPending((n) => n - 1));
  }

  function tickerInUse(ticker: string, ignoreId?: string) {
    const t = ticker.trim().toUpperCase();
    return data.assets.find((a) => a.ticker === t && a.id !== ignoreId);
  }

  /** Cria o ativo com a primeira compra; se o ticker já existe, soma à posição. */
  function addAsset(fresh: NewAsset, buy: Omit<NewOperation, "type">) {
    const existing = tickerInUse(fresh.ticker);
    const asset: Asset = existing ?? { id: uid(), ...fresh };
    const transaction: Transaction = { id: uid(), assetId: asset.id, type: "compra", ...buy };
    setData((prev) => ({
      ...prev,
      assets: existing ? prev.assets : [...prev.assets, asset],
      transactions: [...prev.transactions, transaction],
    }));
    persist(() => persistence.addAsset(asset, transaction));
    return { existing: !!existing };
  }

  function updateAsset(id: string, patch: NewAsset) {
    const asset: Asset = { ...patch, id };
    setData((prev) => ({ ...prev, assets: prev.assets.map((a) => (a.id === id ? asset : a)) }));
    persist(() => persistence.updateAsset(asset));
  }

  function removeAsset(id: string): AssetSnapshot | null {
    const asset = data.assets.find((a) => a.id === id);
    if (!asset) return null;
    const snapshot: AssetSnapshot = {
      asset,
      transactions: data.transactions.filter((t) => t.assetId === id),
      payouts: data.payouts.filter((p) => p.assetId === id),
    };
    setData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
      transactions: prev.transactions.filter((t) => t.assetId !== id),
      payouts: prev.payouts.filter((p) => p.assetId !== id),
    }));
    persist(() => persistence.removeAsset(id));
    return snapshot;
  }

  function restoreAsset(snapshot: AssetSnapshot) {
    setData((prev) => ({
      ...prev,
      assets: [...prev.assets, snapshot.asset],
      transactions: [...prev.transactions, ...snapshot.transactions],
      payouts: [...prev.payouts, ...snapshot.payouts],
    }));
    persist(() => persistence.restoreAsset(snapshot));
  }

  function recordOperation(assetId: string, op: NewOperation) {
    const operation: Transaction = { id: uid(), assetId, ...op };
    setData((prev) => ({ ...prev, transactions: [...prev.transactions, operation] }));
    persist(() => persistence.recordOperation(operation));
  }

  function removeTransaction(id: string) {
    setData((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
    persist(() => persistence.removeTransaction(id));
  }

  function addPayout(p: NewPayout) {
    const payout: Payout = { id: uid(), ...p };
    setData((prev) => ({ ...prev, payouts: [...prev.payouts, payout] }));
    persist(() => persistence.addPayout(payout));
  }

  function removePayout(id: string) {
    setData((prev) => ({ ...prev, payouts: prev.payouts.filter((p) => p.id !== id) }));
    persist(() => persistence.removePayout(id));
  }

  function setPaperTarget(target: number | null) {
    setData((prev) => ({ ...prev, paperTarget: target }));
    persist(() => persistence.setPaperTarget(target));
  }

  return {
    data,
    assets,
    summary,
    /** há mudanças ainda a caminho do banco */
    saving: pending > 0,
    /** a última gravação falhou */
    saveError,
    tickerInUse,
    addAsset,
    updateAsset,
    removeAsset,
    restoreAsset,
    recordOperation,
    removeTransaction,
    addPayout,
    removePayout,
    setPaperTarget,
  };
}

export type Portfolio = ReturnType<typeof usePortfolio>;
