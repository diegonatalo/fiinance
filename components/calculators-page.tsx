"use client";

import { useState } from "react";
import { AveragePriceCalc } from "@/components/average-price-calculator";
import { MagicNumberCalc } from "@/components/magic-number-calculator";
import { PageHeader } from "@/components/page-header";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber } from "@/lib/format";
import type { Asset } from "@/types/fii";

type Tab = "average" | "magic";

const TABS: { value: Tab; label: string }[] = [
  { value: "average", label: "Preço médio" },
  { value: "magic", label: "Número mágico" },
];

export const CalculatorsPage = () => {
  const { assets, updateAsset } = usePortfolioContext();
  const notify = useToast();
  const [tab, setTab] = useState<Tab>("average");

  /** Aplica a compra simulada ao fundo: soma as cotas e grava o novo preço médio (em centavos). */
  function applyBuy({ id, ...asset }: Asset, shares: number, price: number) {
    const total = asset.shares + shares;
    const averagePrice = Math.round(((asset.shares * asset.averagePrice + shares * price) / total) * 100) / 100;
    updateAsset(id, { ...asset, shares: total, averagePrice });
    notify(`${asset.ticker}: ${formatNumber(total)} cotas a ${formatBRL(averagePrice)}`);
  }

  return (
    <>
      <PageHeader title="Calculadoras" description="Simule antes de comprar. Nada é salvo até você aplicar a compra ao fundo." />

      {/* No celular, uma calculadora por vez. */}
      <div
        role="group"
        aria-label="Escolher calculadora"
        className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 md:hidden"
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "h-10 rounded-[9px] text-sm font-medium transition-colors",
              tab === t.value ? "bg-line text-fg" : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <AveragePriceCalc
          assets={assets}
          onRecord={applyBuy}
          className={cn("flex-[1_1_520px]", tab !== "average" && "max-md:hidden")}
        />
        <MagicNumberCalc
          assets={assets}
          className={cn("flex-[1_1_520px]", tab !== "magic" && "max-md:hidden")}
        />
      </div>
    </>
  );
};
