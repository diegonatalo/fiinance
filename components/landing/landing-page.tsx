import Image from "next/image";
import Link from "next/link";
import {
  ArrowsClockwiseIcon,
  CalculatorIcon,
  ChartPieSliceIcon,
  CoinsIcon,
  DownloadSimpleIcon,
  ShieldCheckIcon,
  TargetIcon,
  TrendUpIcon,
} from "@phosphor-icons/react/ssr";
import { LandingHeader } from "@/components/landing/landing-header";
import { Screenshot } from "@/components/landing/screenshot";
import { SiteFooter } from "@/components/site-footer";
import { buttonClasses } from "@/components/ui/button";
import { FAQ, FEATURES, HERO, PHOTO, SEGMENTS, STEPS, type FeatureIcon } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const ICONS: Record<FeatureIcon, typeof CoinsIcon> = {
  chart: ChartPieSliceIcon,
  coins: CoinsIcon,
  target: TargetIcon,
  calculator: CalculatorIcon,
  quote: ArrowsClockwiseIcon,
  backup: DownloadSimpleIcon,
};

const WRAP = "mx-auto w-full max-w-6xl px-4";
const H2 = "text-2xl font-bold tracking-tight text-balance sm:text-3xl";
const PANEL = "rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
const MUTED = "text-zinc-600 dark:text-zinc-400";

/** Cartão de número por cima da foto, no estilo dos cartões do painel. */
const StatCard = ({ label, value, note, className }: { label: string; value: string; note: string; className: string }) => (
  <div className={`${PANEL} absolute w-52 p-4 shadow-xl ${className}`}>
    <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{value}</p>
    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>
  </div>
);

/** Página inicial: apresenta o FIInance e leva ao painel (`/app`). */
export const LandingPage = () => (
  <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
    <LandingHeader />
    <main id="conteudo" className="flex flex-1 flex-col">
      <section className={`${WRAP} grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.05fr]`} aria-labelledby="titulo">
        <div className="flex flex-col gap-5">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <TrendUpIcon size={14} weight="bold" aria-hidden="true" />
            {HERO.kicker}
          </p>
          <h1 id="titulo" className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Sua carteira de FIIs num painel só, <span className="text-emerald-600 dark:text-emerald-400">sem planilha.</span>
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

        {/* Prédio (fundos imobiliários são lajes, galpões e shoppings) com cartões do painel por cima. */}
        <div className="relative pb-10 pl-6 sm:pl-10">
          <div className="overflow-hidden rounded-3xl">
            <Image
              src={PHOTO.src}
              alt={PHOTO.alt}
              width={1600}
              height={900}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <StatCard label="Valor investido" value="R$ 17.005,50" note="5 fundos · exemplo" className="-left-0 top-8 max-sm:hidden" />
          <div className={`${PANEL} absolute bottom-0 right-4 w-60 p-4 shadow-xl`}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Meta de alocação · exemplo</p>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <div className="flex justify-between">
                  <span>Papel</span>
                  <span className="font-mono">meta 40%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-2 w-[40%] rounded-full bg-emerald-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span>Tijolo</span>
                  <span className="font-mono">meta 60%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-2 w-[60%] rounded-full bg-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa com os segmentos que o app usa. */}
      <div className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <ul className={`${WRAP} flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 font-mono text-xs uppercase tracking-wider ${MUTED}`}>
          {SEGMENTS.map((segment) => (
            <li key={segment} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {segment}
            </li>
          ))}
        </ul>
      </div>

      <section id="como-funciona" className={`${WRAP} scroll-mt-20 py-20`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={H2}>
          Como funciona
        </h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 md:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2 bg-white p-6 dark:bg-zinc-900">
              <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">passo {index + 1}/3</span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className={MUTED}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${WRAP} pb-20`} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={H2}>
          Tudo o que a planilha fazia, sem a planilha
        </h2>
        {/* Grade irregular: o print do painel no centro, recursos em volta. */}
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3 lg:row-span-2">
            <Screenshot />
          </div>
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <div key={feature.title} className={`${PANEL} flex flex-col gap-2 p-5`}>
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/10">
                  <Icon size={20} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </span>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className={`text-sm ${MUTED}`}>{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-zinc-900 text-zinc-50 dark:bg-zinc-900" aria-labelledby="titulo-faq">
        <div className={`${WRAP} grid gap-12 py-20 lg:grid-cols-[1fr_1.6fr]`}>
          <div className="flex flex-col gap-4">
            <h2 id="titulo-faq" className={H2}>
              Perguntas frequentes
            </h2>
            <p className="flex items-start gap-3 text-sm text-zinc-300">
              <ShieldCheckIcon size={22} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>
                Privado por padrão: a carteira fica só neste navegador, sem conta nem cookies de rastreamento.{" "}
                <Link href="/privacidade" className="font-semibold text-emerald-300 underline underline-offset-2">
                  Leia a política de privacidade
                </Link>
                .
              </span>
            </p>
          </div>
          <dl className="divide-y divide-zinc-700 border-y border-zinc-700">
            {FAQ.map((item) => (
              <div key={item.question} className="grid gap-2 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="font-semibold">{item.question}</dt>
                <dd className="text-zinc-400">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${WRAP} flex flex-col items-center gap-5 py-20 text-center`} aria-labelledby="titulo-final">
        <h2 id="titulo-final" className={H2}>
          Comece pelo primeiro fundo
        </h2>
        <p className={`max-w-xl ${MUTED}`}>Leva menos de um minuto, e dá para importar um backup depois.</p>
        <Link href="/app/carteira" className={buttonClasses()}>
          Cadastrar meus FIIs
        </Link>
      </section>
    </main>
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);
