import Link from "next/link";
import {
  ArrowsClockwiseIcon,
  CalculatorIcon,
  ChartPieSliceIcon,
  CoinsIcon,
  DownloadSimpleIcon,
  ShieldCheckIcon,
  TargetIcon,
} from "@phosphor-icons/react/ssr";
import { LandingHeader } from "@/components/landing/landing-header";
import { Screenshot } from "@/components/landing/screenshot";
import { SiteFooter } from "@/components/site-footer";
import { buttonClasses } from "@/components/ui/button";
import { FAQ, FEATURES, HERO, STEPS, type FeatureIcon } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const ICONS: Record<FeatureIcon, typeof CoinsIcon> = {
  chart: ChartPieSliceIcon,
  coins: CoinsIcon,
  target: TargetIcon,
  calculator: CalculatorIcon,
  quote: ArrowsClockwiseIcon,
  backup: DownloadSimpleIcon,
};

const SECTION = "mx-auto w-full max-w-5xl px-4";
const H2 = "text-2xl font-bold tracking-tight text-balance sm:text-3xl";
const CARD = "rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900";
const MUTED = "text-zinc-600 dark:text-zinc-400";

/** Página inicial: apresenta o FIInance e leva ao painel (`/app`). */
export const LandingPage = () => (
  <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
    <LandingHeader />
    <main id="conteudo" className="flex flex-1 flex-col gap-20 pb-20">
      <section className={`${SECTION} flex flex-col gap-10 pt-12 sm:pt-16`} aria-labelledby="titulo">
        <div className="flex max-w-3xl flex-col gap-5">
          <p className="text-sm font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
            {HERO.kicker}
          </p>
          <h1 id="titulo" className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {HERO.title}
          </h1>
          <p className={`text-lg text-pretty ${MUTED}`}>{HERO.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={buttonClasses()}>
              Abrir o painel
            </Link>
            <a href="#como-funciona" className={buttonClasses("outline")}>
              Ver como funciona
            </a>
          </div>
          <p className={`text-sm ${MUTED}`}>{HERO.note}</p>
        </div>
        <Screenshot />
      </section>

      <section id="como-funciona" className={`${SECTION} scroll-mt-24`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={H2}>
          Como funciona
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`${CARD} flex flex-col gap-3`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className={MUTED}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={SECTION} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={H2}>
          Tudo o que a planilha fazia, sem a planilha
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <li key={feature.title} className={`${CARD} flex flex-col gap-2`}>
                <Icon size={24} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className={`text-sm ${MUTED}`}>{feature.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={SECTION} aria-labelledby="titulo-privacidade">
        <div className="flex flex-col gap-3 rounded-2xl bg-emerald-500/10 p-8">
          <ShieldCheckIcon size={28} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h2 id="titulo-privacidade" className={H2}>
            Privado por padrão
          </h2>
          <p className="max-w-2xl text-pretty">
            A carteira fica só neste navegador. Não há conta, servidor guardando seus números nem cookies de
            rastreamento.{" "}
            <Link
              href="/privacidade"
              className="font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
            >
              Leia a política de privacidade
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={SECTION} aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={H2}>
          Perguntas frequentes
        </h2>
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question} className={CARD}>
              <dt className="font-semibold">{item.question}</dt>
              <dd className={`mt-2 ${MUTED}`}>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${SECTION} text-center`} aria-labelledby="titulo-final">
        <h2 id="titulo-final" className={H2}>
          Comece pelo primeiro fundo
        </h2>
        <p className={`mx-auto mt-3 max-w-xl ${MUTED}`}>
          Leva menos de um minuto, e dá para importar um backup depois.
        </p>
        <Link href="/app/carteira" className={`${buttonClasses()} mt-6`}>
          Cadastrar meus FIIs
        </Link>
      </section>
    </main>
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);
