"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { buttonClasses } from "@/components/ui/button";

export const NotFoundPage = () => {
  // o servidor só sabe que é uma 404 (não o endereço digitado): lê no navegador
  const pathname = useSyncExternalStore(
    () => () => {},
    () => window.location.pathname,
    () => "",
  );

  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
        <BrandLink />
        <LandingThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pt-12 pb-24 text-center">
        <svg width="200" height="120" viewBox="0 0 200 120" role="img" aria-label="Os dois pilares do FIInance, com o de tijolo caído">
          <rect x="40" y="38" width="28" height="68" rx="7" className="fill-paper" />
          <rect x="84" y="78" width="96" height="28" rx="7" className="fill-brick" />
          <line x1="10" y1="110" x2="190" y2="110" className="stroke-line" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-sm tracking-[0.12em] text-muted">ERRO 404</p>
          <h1 className="text-[clamp(36px,5vw,56px)] leading-[1.05] font-semibold tracking-[-0.045em]">Página não encontrada</h1>
          <p className="max-w-[440px] text-base leading-relaxed text-muted">
            {pathname && (
              <>
                Não existe nada em{" "}
                <code className="rounded-lg border border-line bg-surface px-2 py-0.5 font-mono text-sm break-all text-fg">
                  {pathname}
                </code>
                .{" "}
              </>
            )}
            O endereço pode ter mudado ou estar errado.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/app" className={buttonClasses("primary", "h-12")}>
            Voltar ao painel
          </Link>
          <Link href="/" className={buttonClasses("outline", "h-12")}>
            Página inicial
          </Link>
        </div>
      </main>
    </div>
  );
};
