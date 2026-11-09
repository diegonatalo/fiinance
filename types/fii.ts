export type FiiTipo = "papel" | "tijolo";

export type SegmentoPapel = "IPCA" | "CDI";

export type SegmentoTijolo =
  | "lajes"
  | "logística"
  | "shoppings"
  | "híbrido"
  | "outro";

export type Segmento = SegmentoPapel | SegmentoTijolo;

export const SEGMENTOS_PAPEL: SegmentoPapel[] = ["IPCA", "CDI"];

export const SEGMENTOS_TIJOLO: SegmentoTijolo[] = [
  "lajes",
  "logística",
  "shoppings",
  "híbrido",
  "outro",
];

/** Cadastro do fundo. A posição (cotas e preço médio) é derivada das transações. */
export type Ativo = {
  id: string;
  ticker: string;
  tipo: FiiTipo;
  segmento: Segmento;
};

/** Posição consolidada de um ativo, calculada a partir das transações. */
export type Fii = Ativo & {
  cotas: number;
  precoMedio: number;
};

export type TipoOperacao = "compra" | "venda";

export type Transacao = {
  id: string;
  ativoId: string;
  tipo: TipoOperacao;
  /** yyyy-mm-dd */
  data: string;
  cotas: number;
  preco: number;
};

export type Provento = {
  id: string;
  ativoId: string;
  /** yyyy-mm-dd */
  data: string;
  valorPorCota: number;
  /** cotas que geraram o provento (na data do recebimento) */
  cotas: number;
};

export type Cotacao = {
  preco: number;
  /** ISO datetime */
  atualizadoEm: string;
};

export type Dados = {
  versao: 1;
  ativos: Ativo[];
  transacoes: Transacao[];
  proventos: Provento[];
  /** indexado por id do ativo */
  cotacoes: Record<string, Cotacao>;
  /** meta de alocação em papel, de 0 a 100 (o restante vai para tijolo) */
  metaPapel: number | null;
};
