import { BRICK_SEGMENTS, RISK_PROFILES } from "@/types/fii";

/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

export const HERO = {
  kicker: "Carteira de fundos imobiliários",
  title: "Sua carteira de FIIs em papel e tijolo.",
  subtitle:
    "O FIInance mostra quanto você investiu, o peso de cada fundo e quanto a carteira deve render por mês. Você dá uma nota a cada fundo, e ele diz onde aportar para chegar na carteira que você quer.",
  note: "Grátis. Crie uma conta e sua carteira fica salva em qualquer aparelho.",
};

export type Step = { title: string; text: string };

export const STEPS: Step[] = [
  {
    title: "Cadastre seus fundos",
    text: "Informe o ticker, as cotas, o preço médio e o último rendimento, e se é tijolo (com o segmento) ou papel (com o perfil de risco).",
  },
  {
    title: "Dê uma nota a cada um",
    text: "De 1 a 10. A nota define a meta do fundo na carteira: quanto maior, maior a fatia.",
  },
  {
    title: "Aporte onde falta",
    text: "Veja quem está abaixo da meta e quanto do próximo aporte vai para cada fundo.",
  },
];

export type FeatureIcon = "chart" | "coins" | "target" | "calculator" | "device" | "account";

export type Feature = { icon: FeatureIcon; title: string; text: string };

export const FEATURES: Feature[] = [
  {
    icon: "chart",
    title: "Painel com gráficos",
    text: "Total investido, o peso de cada fundo e a diversificação por tipo, por segmento e por risco, em gráficos de donut.",
  },
  {
    icon: "coins",
    title: "Proventos esperados",
    text: "O último rendimento de cada fundo vezes as suas cotas: quanto a carteira deve pagar no mês.",
  },
  {
    icon: "target",
    title: "Meta pela nota",
    text: "Compare o peso de cada fundo com a meta dada pela nota e saiba onde aportar antes de comprar.",
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
  alt: "Painel do FIInance com patrimônio, proventos esperados, a diversificação em donuts e o peso de cada fundo.",
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
export const SEGMENTS = [
  ...BRICK_SEGMENTS.filter((s) => s !== "outro").map((s) => `Tijolo · ${s}`),
  ...RISK_PROFILES.map((r) => `Papel · ${r}`),
];
