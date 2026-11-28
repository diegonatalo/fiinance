import { useMemo, useRef, useState } from "react";
import { uid } from "@/lib/id";
import { calculateSummary } from "@/lib/summary";
import type { Asset, AppData } from "@/types/fii";

export type NewAsset = Omit<Asset, "id">;

/** Onde cada mudança é gravada (as Server Actions, presas à conta da tela). */
export type Persistence = {
  addAsset: (asset: Asset) => Promise<unknown>;
  updateAsset: (asset: Asset) => Promise<unknown>;
  removeAsset: (id: string) => Promise<unknown>;
  restoreAsset: (asset: Asset) => Promise<unknown>;
};

export const SAVE_ERROR = "Não foi possível salvar a última mudança. Recarregue a página para ver o que ficou salvo.";

/**
 * A carteira na tela. Cada mudança aparece na hora e é gravada em segundo plano,
 * uma de cada vez e na ordem em que aconteceu.
 */
export function usePortfolio(initialData: AppData, persistence: Persistence) {
  const [data, setData] = useState<AppData>(initialData);
  const [pending, setPending] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());

  const assets = data.assets;
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
    return assets.find((a) => a.ticker === t && a.id !== ignoreId);
  }

  function addAsset(fresh: NewAsset) {
    const asset: Asset = { id: uid(), ...fresh };
    setData((prev) => ({ ...prev, assets: [...prev.assets, asset] }));
    persist(() => persistence.addAsset(asset));
    return asset;
  }

  function updateAsset(id: string, patch: NewAsset) {
    const asset: Asset = { ...patch, id };
    setData((prev) => ({ ...prev, assets: prev.assets.map((a) => (a.id === id ? asset : a)) }));
    persist(() => persistence.updateAsset(asset));
  }

  /** Tira o fundo da carteira; devolve o fundo para o "desfazer". */
  function removeAsset(id: string): Asset | null {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return null;
    setData((prev) => ({ ...prev, assets: prev.assets.filter((a) => a.id !== id) }));
    persist(() => persistence.removeAsset(id));
    return asset;
  }

  function restoreAsset(asset: Asset) {
    setData((prev) => ({ ...prev, assets: [...prev.assets, asset] }));
    persist(() => persistence.restoreAsset(asset));
  }

  return {
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
  };
}

export type Portfolio = ReturnType<typeof usePortfolio>;
