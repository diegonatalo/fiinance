"use client";

import { useState } from "react";
import { AveragePriceCalc } from "@/components/average-price-calculator";
import { MagicNumberCalc } from "@/components/magic-number-calculator";
import { OperationModal, type InitialOperation } from "@/components/operation-modal";
import { PageHeader } from "@/components/page-header";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { cn } from "@/lib/cn";
import type { Fii } from "@/types/fii";

type Tab = "average" | "magic";

const TABS: { value: Tab; label: string }[] = [
  { value: "average", label: "Preço médio" },
  { value: "magic", label: "Número mágico" },
];

export const CalculatorsPage = () => {
  const { assets, data } = usePortfolioContext();
  const [tab, setTab] = useState<Tab>("average");
  const [record, setRecord] = useState<{ asset: Fii; initialValues: InitialOperation } | null>(null);

  const currentAsset = assets.find((a) => a.id === record?.asset.id) ?? null;

  return (
    <>
      <PageHeader title="Calculadoras" description="Simule antes de comprar. Nada é salvo até você registrar." />

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
          onRecord={(asset, shares, price) => setRecord({ asset, initialValues: { type: "compra", shares, price } })}
          className={cn("flex-[1_1_520px]", tab !== "average" && "max-md:hidden")}
        />
        <MagicNumberCalc
          assets={assets}
          payouts={data.payouts}
          className={cn("flex-[1_1_520px]", tab !== "magic" && "max-md:hidden")}
        />
      </div>

      <OperationModal asset={currentAsset} initialValues={record?.initialValues} onClose={() => setRecord(null)} />
    </>
  );
};
