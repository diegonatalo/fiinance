"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningIcon } from "@phosphor-icons/react";
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
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
        <WarningIcon size={28} aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">Algo deu errado</h1>
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Esta tela encontrou um erro inesperado. Tente de novo ou volte ao painel.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className={buttonClasses()}>
          Tentar de novo
        </button>
        <Link href="/" className={buttonClasses("outline")}>
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
};
