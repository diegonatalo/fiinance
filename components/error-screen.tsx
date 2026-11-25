"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { buttonClasses } from "@/components/ui/button";

type ErrorScreenProps = {
  error: unknown;
  retry: () => void;
};

export const ErrorScreen = ({ error, retry }: ErrorScreenProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-[1200px] items-center px-6 py-4">
        <BrandLink />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pt-12 pb-24 text-center">
        <span className="inline-flex size-[72px] items-center justify-center rounded-[22px] border border-brick/30 bg-brick/12 text-brick">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l9.5 17h-19z" />
            <path d="M12 10v4M12 17.5h.01" />
          </svg>
        </span>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-[clamp(36px,5vw,56px)] leading-[1.05] font-semibold tracking-[-0.045em]">Algo deu errado</h1>
          <p className="max-w-[420px] text-base leading-relaxed text-muted">
            Esta tela encontrou um erro inesperado. Seus dados continuam salvos. Tente de novo ou volte ao painel.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => retry()} className={buttonClasses("primary", "h-12")}>
            Tentar de novo
          </button>
          <Link href="/app" className={buttonClasses("outline", "h-12")}>
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
