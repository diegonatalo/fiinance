/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

export const HERO = {
  kicker: "Carteira de fundos imobiliários",
  title: "Sua carteira de FIIs em papel e tijolo.",
  subtitle:
    "O FIInance mostra quanto você investiu, quanto a carteira vale hoje e quanto ela rende por mês. E diz quanto falta aportar em papel e em tijolo para chegar na alocação que você quer.",
  note: "Grátis. Crie uma conta e sua carteira fica salva em qualquer aparelho.",
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

export type FeatureIcon = "chart" | "coins" | "target" | "calculator" | "device" | "account";

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
    icon: "account",
    title: "Na sua conta",
    text: "A carteira fica salva na sua conta e aparece igual no celular e no computador.",
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
  { question: "É grátis?", answer: "É. Não tem plano pago nem propaganda; só pede uma conta com e-mail e senha." },
  {
    question: "Onde ficam os meus dados?",
    answer:
      "Na sua conta, num banco de dados (Neon), com o site hospedado na Vercel. Ninguém mais recebe seus dados, e você pode excluir a conta e tudo o que está nela quando quiser.",
  },
  {
    question: "Como vejo a carteira em outro aparelho?",
    answer: "É só entrar com a mesma conta. A carteira é a mesma no celular e no computador.",
  },
  {
    question: "É recomendação de investimento?",
    answer: "Não. O FIInance só organiza os seus números; as decisões são suas.",
  },
];

/** Tipos e segmentos que o app usa para classificar cada fundo (`types/fii.ts`). */
export const SEGMENTS = ["Tijolo · lajes", "Tijolo · logística", "Tijolo · shoppings", "Tijolo · híbrido", "Papel · CDI", "Papel · IPCA"];
