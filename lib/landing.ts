/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

export const HERO = {
  kicker: "Carteira de fundos imobiliários",
  title: "Sua carteira de FIIs em papel e tijolo.",
  subtitle:
    "O FIInance mostra quanto você investiu, quanto a carteira vale hoje e quanto ela rende por mês. E diz quanto falta aportar em papel e em tijolo para chegar na alocação que você quer.",
  note: "Grátis e sem cadastro. Seus dados ficam só no seu navegador.",
};

export type Step = { title: string; text: string };

export const STEPS: Step[] = [
  {
    title: "Cadastre seus fundos",
    text: "Informe o ticker, as cotas e o preço pago. Compras e vendas viram o preço médio de cada fundo.",
  },
  {
    title: "Lance os proventos",
    text: "Registre o que cada fundo pagou no mês e acompanhe a renda passiva crescer.",
  },
  {
    title: "Ajuste a alocação",
    text: "Defina a meta entre papel e tijolo e veja quanto aportar em cada um para chegar nela.",
  },
];

export type FeatureIcon = "chart" | "coins" | "target" | "calculator" | "device" | "backup";

export type Feature = { icon: FeatureIcon; title: string; text: string };

export const FEATURES: Feature[] = [
  {
    icon: "chart",
    title: "Painel com gráficos",
    text: "Valor investido, valor atual, distribuição por tipo e segmento e a evolução da carteira ao longo do tempo.",
  },
  {
    icon: "coins",
    title: "Proventos por mês",
    text: "Histórico de rendimentos por fundo e por mês, com o gráfico da renda passiva.",
  },
  {
    icon: "target",
    title: "Meta de alocação",
    text: "Compare a carteira com a meta e saiba onde aportar antes de comprar.",
  },
  {
    icon: "calculator",
    title: "Calculadoras",
    text: "Preço médio depois de uma nova compra e o número mágico: quantas cotas para o provento pagar uma cota nova.",
  },
  {
    icon: "device",
    title: "No celular e no computador",
    text: "Tema claro ou escuro, barra de abas no celular e uma carteira que vira lista em telas pequenas.",
  },
  {
    icon: "backup",
    title: "Backup e planilha",
    text: "Exporte tudo em JSON para guardar ou levar para outro computador, e as operações em CSV para o Excel.",
  },
];

export type Screenshot = { light: string; dark: string; alt: string };

/** Prints gerados por `e2e/screenshots.spec.ts` (nunca à mão). */
export const SCREENSHOT: Screenshot = {
  light: "/landing/painel-claro.webp",
  dark: "/landing/painel-escuro.webp",
  alt: "Painel do FIInance com patrimônio, evolução, alocação e o peso de cada fundo.",
};

export type Faq = { question: string; answer: string };

export const FAQ: Faq[] = [
  { question: "É grátis?", answer: "É. Não tem plano pago nem cadastro." },
  {
    question: "Onde ficam os meus dados?",
    answer:
      "Só no seu navegador. Nada do que você cadastra vai para um servidor nosso, e não tem conta nem cookie de rastreamento.",
  },
  {
    question: "Como levo a carteira para outro computador?",
    answer:
      "Exporte o backup em JSON num computador e importe no outro. Limpar os dados do navegador apaga a carteira, então guarde um backup.",
  },
  {
    question: "É recomendação de investimento?",
    answer: "Não. O FIInance só organiza os seus números; as decisões são suas.",
  },
];

/** Tipos e segmentos que o app usa para classificar cada fundo (`types/fii.ts`). */
export const SEGMENTS = ["Tijolo · lajes", "Tijolo · logística", "Tijolo · shoppings", "Tijolo · híbrido", "Papel · CDI", "Papel · IPCA"];
