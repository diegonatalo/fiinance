import { useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import { EMPTY_DATA, sanitizeData, sanitizeOrEmpty } from "@/lib/data";
import { DATA_KEY } from "@/lib/storage-keys";
import { uid } from "@/lib/id";
import { calculatePositions } from "@/lib/position";
import { calculateSummary } from "@/lib/summary";
import type {
  Asset,
  AppData,
  Payout,
  Transaction,
  OperationType,
} from "@/types/fii";

export type NewAsset = Omit<Asset, "id">;

export interface NewOperation {
  type: OperationType;
  date: string;
  shares: number;
  price: number;
}

export interface NewPayout {
  assetId: string;
  date: string;
  valuePerShare: number;
  shares: number;
}

/** Tudo o que pertence a um ativo, para permitir "desfazer" a exclusão. */
export interface AssetSnapshot {
  asset: Asset;
  transactions: Transaction[];
  payouts: Payout[];
  quote: AppData["quotes"][string] | undefined;
}

export function usePortfolio() {
  const [data, setData] = useLocalStorage<AppData>(
    DATA_KEY,
    EMPTY_DATA,
    sanitizeOrEmpty,
  );

  const assets = useMemo(
    () => calculatePositions(data.assets, data.transactions),
    [data.assets, data.transactions],
  );
  const summary = useMemo(
    () => calculateSummary(assets, data.quotes),
    [assets, data.quotes],
  );

  function tickerInUse(ticker: string, ignoreId?: string) {
    const t = ticker.trim().toUpperCase();
    return data.assets.find((a) => a.ticker === t && a.id !== ignoreId);
  }

  /** Cria o ativo com a primeira compra; se o ticker já existe, soma à posição. */
  function addAsset(fresh: NewAsset, buy: Omit<NewOperation, "type">) {
    const existing = tickerInUse(fresh.ticker);
    const assetId = existing?.id ?? uid();
    const transaction: Transaction = {
      id: uid(),
      assetId,
      type: "compra",
      ...buy,
    };
    setData((prev) => ({
      ...prev,
      assets: existing ? prev.assets : [...prev.assets, { id: assetId, ...fresh }],
      transactions: [...prev.transactions, transaction],
    }));
    return { existing: !!existing };
  }

  function updateAsset(id: string, patch: NewAsset) {
    setData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === id ? { ...patch, id } : a)),
    }));
  }

  function removeAsset(id: string): AssetSnapshot | null {
    const asset = data.assets.find((a) => a.id === id);
    if (!asset) return null;
    const snapshot: AssetSnapshot = {
      asset,
      transactions: data.transactions.filter((t) => t.assetId === id),
      payouts: data.payouts.filter((p) => p.assetId === id),
      quote: data.quotes[id],
    };
    setData((prev) => {
      const quotes = { ...prev.quotes };
      delete quotes[id];
      return {
        ...prev,
        assets: prev.assets.filter((a) => a.id !== id),
        transactions: prev.transactions.filter((t) => t.assetId !== id),
        payouts: prev.payouts.filter((p) => p.assetId !== id),
        quotes,
      };
    });
    return snapshot;
  }

  function restoreAsset({ asset, transactions, payouts, quote }: AssetSnapshot) {
    setData((prev) => ({
      ...prev,
      assets: [...prev.assets, asset],
      transactions: [...prev.transactions, ...transactions],
      payouts: [...prev.payouts, ...payouts],
      quotes: quote ? { ...prev.quotes, [asset.id]: quote } : prev.quotes,
    }));
  }

  function recordOperation(assetId: string, op: NewOperation) {
    setData((prev) => ({
      ...prev,
      transactions: [...prev.transactions, { id: uid(), assetId, ...op }],
    }));
  }

  function removeTransaction(id: string) {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }

  function addPayout(p: NewPayout) {
    setData((prev) => ({
      ...prev,
      payouts: [...prev.payouts, { id: uid(), ...p }],
    }));
  }

  function removePayout(id: string) {
    setData((prev) => ({
      ...prev,
      payouts: prev.payouts.filter((p) => p.id !== id),
    }));
  }

  function setQuotes(prices: Record<string, number>) {
    const updatedAt = new Date().toISOString();
    setData((prev) => {
      const quotes = { ...prev.quotes };
      for (const [id, price] of Object.entries(prices)) {
        if (price > 0) quotes[id] = { price, updatedAt };
        else delete quotes[id];
      }
      return { ...prev, quotes };
    });
  }

  function setPaperTarget(target: number | null) {
    setData((prev) => ({ ...prev, paperTarget: target }));
  }

  /** Substitui todos os dados por um backup. Retorna false se o conteúdo for inválido. */
  function importData(content: string): boolean {
    try {
      const fresh = sanitizeData(JSON.parse(content));
      if (!fresh) return false;
      setData(fresh);
      return true;
    } catch {
      return false;
    }
  }

  return {
    data,
    assets,
    summary,
    tickerInUse,
    addAsset,
    updateAsset,
    removeAsset,
    restoreAsset,
    recordOperation,
    removeTransaction,
    addPayout,
    removePayout,
    setQuotes,
    setPaperTarget,
    importData,
  };
}

export type Portfolio = ReturnType<typeof usePortfolio>;
