"use client";

import { useState } from "react";
import { MagicNumberCalc } from "@/components/magic-number-calculator";
import { AveragePriceCalc } from "@/components/average-price-calculator";
import {
  OperationModal,
  type InitialOperation,
} from "@/components/operation-modal";
import { usePortfolioContext } from "@/lib/portfolio-context";
import type { Fii } from "@/types/fii";

export function CalculatorsPage() {
  const { assets, data } = usePortfolioContext();
  const [record, setRecord] = useState<{
    asset: Fii;
    initialValues: InitialOperation;
  } | null>(null);

  const currentAsset = assets.find((a) => a.id === record?.asset.id) ?? null;

  return (
    <>
      <MagicNumberCalc
        assets={assets}
        payouts={data.payouts}
        quotes={data.quotes}
      />
      <AveragePriceCalc
        assets={assets}
        onRecord={(asset, shares, price) =>
          setRecord({ asset, initialValues: { type: "compra", shares, price } })
        }
      />
      <OperationModal
        asset={currentAsset}
        initialValues={record?.initialValues}
        onClose={() => setRecord(null)}
      />
    </>
  );
}
