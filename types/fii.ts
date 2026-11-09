export type FiiType = "papel" | "tijolo";

export type PaperSegment = "IPCA" | "CDI";

export type BrickSegment =
  | "lajes"
  | "logística"
  | "shoppings"
  | "híbrido"
  | "outro";

export type Segment = PaperSegment | BrickSegment;

export const PAPER_SEGMENTS: PaperSegment[] = ["IPCA", "CDI"];

export const BRICK_SEGMENTS: BrickSegment[] = [
  "lajes",
  "logística",
  "shoppings",
  "híbrido",
  "outro",
];

/** Cadastro do fundo. A posição (cotas e preço médio) é derivada das transações. */
export type Asset = {
  id: string;
  ticker: string;
  type: FiiType;
  segment: Segment;
};

/** Posição consolidada de um ativo, calculada a partir das transações. */
export type Fii = Asset & {
  shares: number;
  averagePrice: number;
};

export type OperationType = "compra" | "venda";

export type Transaction = {
  id: string;
  assetId: string;
  type: OperationType;
  /** yyyy-mm-dd */
  date: string;
  shares: number;
  price: number;
};

export type Payout = {
  id: string;
  assetId: string;
  /** yyyy-mm-dd */
  date: string;
  valuePerShare: number;
  /** cotas que geraram o provento (na data do recebimento) */
  shares: number;
};

export type Quote = {
  price: number;
  /** ISO datetime */
  updatedAt: string;
};

export type AppData = {
  version: 2;
  assets: Asset[];
  transactions: Transaction[];
  payouts: Payout[];
  /** indexado por id do ativo */
  quotes: Record<string, Quote>;
  /** meta de alocação em papel, de 0 a 100 (o restante vai para tijolo) */
  paperTarget: number | null;
};
