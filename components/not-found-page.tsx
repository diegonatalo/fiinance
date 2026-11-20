"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { CompassIcon } from "@phosphor-icons/react";

export const NotFoundPage = () => {
  // o servidor só sabe que é uma 404 (não o endereço digitado): lê no navegador
  const pathname = useSyncExternalStore(
    () => () => {},
    () => window.location.pathname,
    () => "",
  );

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <CompassIcon size={28} />
      </div>
      <div>
        <p className="text-5xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          404
        </p>
        <h1 className="mt-2 text-lg font-semibold">Página não encontrada</h1>
        {pathname && (
          <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">
            Não existe nada em{" "}
            <code className="rounded bg-zinc-200/70 px-1.5 py-0.5 dark:bg-zinc-800">
              {pathname}
            </code>
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/app" className={buttonClasses()}>
          Abrir o painel
        </Link>
        <Link href="/" className={buttonClasses("outline")}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
};
