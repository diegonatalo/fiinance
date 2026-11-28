export type FiiType = "papel" | "tijolo";

export type BrickSegment =
  | "logístico"
  | "renda urbana"
  | "híbrido"
  | "lajes corporativas"
  | "shoppings"
  | "fazendas"
  | "outro";

export type RiskProfile = "High Grade" | "Middle Risk" | "High Yield";

export const BRICK_SEGMENTS: BrickSegment[] = [
  "logístico",
  "renda urbana",
  "híbrido",
  "lajes corporativas",
  "shoppings",
  "fazendas",
  "outro",
];

export const RISK_PROFILES: RiskProfile[] = ["High Grade", "Middle Risk", "High Yield"];

export const MIN_RATING = 1;
export const MAX_RATING = 10;
export const DEFAULT_RATING = 5;

/**
 * Um fundo da carteira, com a posição digitada pela pessoa. Tijolo tem segmento
 * e papel tem perfil de risco; o outro campo fica null.
 */
export type Asset = {
  id: string;
  ticker: string;
  type: FiiType;
  /** só tijolo */
  segment: BrickSegment | null;
  /** só papel; null num fundo de papel que veio de antes do perfil de risco existir */
  risk: RiskProfile | null;
  shares: number;
  /** em reais */
  averagePrice: number;
  /** último rendimento por cota, em reais (até 4 casas) */
  lastDividend: number;
  /** de 1 a 10: pesa na meta do fundo na carteira */
  rating: number;
};

/** A carteira da pessoa logada, como o app usa. */
export type AppData = {
  assets: Asset[];
};
