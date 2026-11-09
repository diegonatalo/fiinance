"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "./theme-toggle";
import { BuildingsIcon } from "@phosphor-icons/react";

const navItems = [
  { to: "/", label: "Painel", end: true },
  { to: "/carteira", label: "Carteira", end: false },
  { to: "/proventos", label: "Proventos", end: false },
  { to: "/calculadoras", label: "Calculadoras", end: false },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { theme, toggle } = useTheme();
  const pathname = usePathname() ?? "";

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <BuildingsIcon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">
                FIInance
              </h1>
              <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
                transforme dados em decisões
              </p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
          {navItems.map((item) => {
            const isActive = item.end
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6 *:min-w-0">
        {children}
      </main>
    </div>
  );
};
