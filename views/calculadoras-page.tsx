"use client";

import { useState } from "react";
import { MagicNumberCalc } from "@/components/magic-number-calculator";
import { PrecoMedioCalc } from "@/components/preco-medio-calculator";
import {
  OperacaoModal,
  type OperacaoInicial,
} from "@/components/operacao-modal";
import { useCarteiraContext } from "@/contexts/carteira-context";
import type { Fii } from "@/models/fii";

export function CalculadorasPage() {
  const { ativos, dados } = useCarteiraContext();
  const [registro, setRegistro] = useState<{
    ativo: Fii;
    inicial: OperacaoInicial;
  } | null>(null);

  const ativoAtual = ativos.find((a) => a.id === registro?.ativo.id) ?? null;

  return (
    <>
      <MagicNumberCalc
        ativos={ativos}
        proventos={dados.proventos}
        cotacoes={dados.cotacoes}
      />
      <PrecoMedioCalc
        ativos={ativos}
        onRegistrar={(ativo, cotas, preco) =>
          setRegistro({ ativo, inicial: { tipo: "compra", cotas, preco } })
        }
      />
      <OperacaoModal
        ativo={ativoAtual}
        inicial={registro?.inicial}
        onClose={() => setRegistro(null)}
      />
    </>
  );
}
