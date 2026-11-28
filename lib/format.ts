import type { Asset } from "@/types/fii";

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatSignedPct(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${formatPct(value, decimals)}`;
}

/** Variação com sinal tipográfico: "+3,09%" ou "−3,14%". */
export function formatChange(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : "−"}${formatPct(Math.abs(value), decimals)}`;
}

/** Variação com seta: "▲ +3,09%" ou "▼ −3,14%". */
export function formatDelta(value: number, decimals = 2): string {
  return `${value >= 0 ? "▲" : "▼"} ${formatChange(value, decimals)}`;
}


/** Último rendimento por cota: 2 casas, ou até 4 quando precisa ("R$ 0,0825"). */
export function formatDividend(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Tijolo · Logístico", "Papel · High Grade" ou "Papel · sem perfil de risco". */
export function formatKind(asset: Pick<Asset, "type" | "segment" | "risk">): string {
  if (asset.type === "papel") return `Papel · ${asset.risk ?? "sem perfil de risco"}`;
  return `Tijolo · ${asset.segment ? capitalize(asset.segment) : "sem segmento"}`;
}
