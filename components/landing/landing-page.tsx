import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { LandingHeader } from "@/components/landing/landing-header";
import { Screenshot } from "@/components/landing/screenshot";
import { SiteFooter } from "@/components/site-footer";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { FAQ, FEATURES, HERO, SEGMENTS, STEPS, type FeatureIcon } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

/** Ícones dos recursos, no traço da identidade, com a cor de cada um. */
const ICONS: Record<FeatureIcon, { path: string; tint: string }> = {
  chart: { path: "M4 19h16M6 16V9M11 16V5M16 16v-5", tint: "text-paper" },
  coins: {
    path: "M12 3c-4 0-7 1.3-7 3s3 3 7 3 7-1.3 7-3-3-3-7-3zM5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6",
    tint: "text-brick",
  },
  target: { path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01", tint: "text-paper" },
  calculator: {
    path: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01",
    tint: "text-brick",
  },
  device: { path: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2", tint: "text-up" },
  account: { path: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0", tint: "text-paper" },
};

const WRAP = "mx-auto w-full max-w-[1200px] px-6";
const H2 = "text-[clamp(32px,4vw,44px)] font-semibold tracking-[-0.04em]";

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Prévia ilustrativa do painel no topo da página (valores de exemplo). */
const HeroPreview = () => (
  <div aria-hidden="true" className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
    <div className="flex flex-col gap-3.5 rounded-3xl border border-line bg-surface p-7">
      <span className="text-sm text-muted">Patrimônio</span>
      <span className="text-[clamp(36px,4.6vw,52px)] leading-none font-semibold tracking-[-0.045em] tabular-nums">
        R$ 28.616,91
      </span>
      <span className="text-[15px] text-muted tabular-nums">investido em 7 fundos · 932 cotas</span>
      <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="block h-[120px] w-full">
        <path
          d="M20 170 L104 152 L188 132 L272 114 L356 106 L440 78 L524 66 L608 57 L692 46 L776 38 L776 200 L20 200 Z"
          className="fill-fg"
          fillOpacity="0.05"
        />
        <path
          d="M20 170 L104 152 L188 132 L272 114 L356 106 L440 78 L524 66 L608 57 L692 46 L776 38"
          fill="none"
          className="stroke-fg"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
    <div className="flex flex-wrap gap-3.5">
      <div className="flex flex-[1_1_180px] flex-col gap-1 rounded-[20px] border border-brick/25 bg-brick/10 p-5">
        <span className="text-[13px] text-brick-strong">Próximo aporte</span>
        <span className="text-[22px] font-semibold tracking-[-0.03em] tabular-nums">R$ 8.381,84</span>
        <span className="text-[13px] text-muted">em tijolo, para a meta 40/60</span>
      </div>
      <div className="flex flex-[1_1_180px] flex-col gap-1 rounded-[20px] border border-line bg-surface p-5">
        <span className="text-[13px] text-muted">Renda por mês</span>
        <span className="text-[22px] font-semibold tracking-[-0.03em] tabular-nums">R$ 123,14</span>
        <span className="text-[13px] text-muted">média de 12 meses</span>
      </div>
    </div>
  </div>
);

/** Página inicial: apresenta o FIInance e leva ao app (`/app`). */
export const LandingPage = () => (
  <div className="flex min-h-full flex-col bg-bg text-fg">
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
    >
      Pular para o conteúdo
    </a>
    <LandingHeader />
    <main id="conteudo" className="flex flex-1 flex-col">
      <section className={cn(WRAP, "flex flex-wrap items-center gap-14 pt-14 pb-16 md:pt-22 md:pb-18")} aria-labelledby="titulo">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
          <p className="font-mono text-xs tracking-[0.1em] text-muted uppercase">{HERO.kicker}</p>
          <h1 id="titulo" className="text-[clamp(44px,6.4vw,76px)] leading-none font-semibold tracking-[-0.05em] text-balance">
            Sua carteira de FIIs em <span className="text-paper">papel</span> e <span className="text-brick">tijolo</span>.
          </h1>
          <p className="max-w-[540px] text-lg leading-relaxed text-muted">{HERO.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={buttonClasses("primary", undefined, "lg")}>
              Abrir o app <ArrowIcon />
            </Link>
            <a href="#como-funciona" className={buttonClasses("outline", undefined, "lg")}>
              Ver como funciona
            </a>
          </div>
          <p className="text-sm text-subtle">{HERO.note}</p>
        </div>
        <HeroPreview />
      </section>

      <section aria-label="Tipos e segmentos" className="border-y border-hairline">
        <ul className={cn(WRAP, "flex flex-wrap justify-center gap-x-7 gap-y-2.5 py-5 font-mono text-[13px] text-muted")}>
          {SEGMENTS.map((segment) => (
            <li key={segment}>
              <span className={segment.startsWith("Papel") ? "text-paper" : "text-brick"} aria-hidden="true">
                ■
              </span>{" "}
              {segment}
            </li>
          ))}
        </ul>
      </section>

      <section id="como-funciona" className={cn(WRAP, "flex scroll-mt-6 flex-col gap-10 py-24")} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={H2}>
          Como funciona
        </h2>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 border-t border-line pt-6">
              <span className={cn("font-mono text-[13px]", index === STEPS.length - 1 ? "text-brick" : "text-paper")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="recursos" className="scroll-mt-6 border-y border-hairline bg-sunken" aria-labelledby="titulo-recursos">
        <div className={cn(WRAP, "flex flex-col gap-10 py-24")}>
          <h2 id="titulo-recursos" className={H2}>
            Tudo o que a planilha fazia, sem a planilha
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            {FEATURES.map((feature) => {
              const icon = ICONS[feature.icon];
              return (
                <li key={feature.title} className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-7">
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-xl bg-raised", icon.tint)}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={icon.path} />
                    </svg>
                  </span>
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{feature.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{feature.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className={cn(WRAP, "flex flex-col gap-8 py-24")} aria-labelledby="titulo-painel">
        <div className="flex flex-col gap-3">
          <h2 id="titulo-painel" className={H2}>
            O painel
          </h2>
          <p className="text-base text-muted">Patrimônio, evolução, alocação e o peso de cada fundo numa tela só.</p>
        </div>
        <figure className="rounded-[28px] border border-line bg-surface p-3">
          <Screenshot />
          <figcaption className="px-2 pt-3.5 pb-1 text-[13px] text-subtle">Print gerado com dados de exemplo.</figcaption>
        </figure>
      </section>

      <section className={WRAP}>
        <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-line p-8 md:p-10">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-up">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <p className="flex-[1_1_420px] text-xl leading-normal tracking-[-0.01em]">
            Sua carteira fica na sua conta, sem propaganda e sem cookie de rastreamento.
          </p>
          <Link href="/privacidade" className="text-[15px] font-medium text-paper underline">
            Ler a política
          </Link>
        </div>
      </section>

      <section id="perguntas" className="mx-auto flex w-full max-w-[820px] scroll-mt-6 flex-col gap-8 px-6 py-24" aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={H2}>
          Perguntas
        </h2>
        <div className="flex flex-col">
          {FAQ.map((item, index) => (
            <details key={item.question} open={index === 0} className="group border-t border-line py-[22px]">
              <summary className="cursor-pointer text-lg font-medium">{item.question}</summary>
              <p className="mt-3 text-base leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-hairline" aria-labelledby="titulo-final">
        <div className={cn(WRAP, "flex flex-col items-center gap-7 py-28 text-center")}>
          <BrandMark size={64} />
          <h2 id="titulo-final" className="max-w-[760px] text-[clamp(36px,5vw,60px)] leading-[1.05] font-semibold tracking-[-0.05em]">
            Sua renda, tijolo a tijolo.
          </h2>
          <Link href="/app" className={buttonClasses("primary", undefined, "lg")}>
            Abrir o app
          </Link>
          <p className="text-sm text-subtle">Grátis e sem propaganda.</p>
        </div>
      </section>
    </main>
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);
