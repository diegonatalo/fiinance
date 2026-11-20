"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { THEME_KEY } from "@/lib/storage-keys";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";
import {
  BuildingsIcon,
  CalculatorIcon,
  CoinsIcon,
  SquaresFourIcon,
  WalletIcon,
} from "@phosphor-icons/react";

const navItems = [
  { to: "/app", label: "Painel", end: true, icon: SquaresFourIcon },
  { to: "/app/carteira", label: "Carteira", end: false, icon: WalletIcon },
  { to: "/app/proventos", label: "Proventos", end: false, icon: CoinsIcon },
  { to: "/app/calculadoras", label: "Calculadoras", end: false, icon: CalculatorIcon },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { theme, toggle } = useTheme(THEME_KEY);
  const pathname = usePathname() ?? "";
  const isActive = (item: (typeof navItems)[number]) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to);

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" aria-label="FIInance, página inicial" className="flex items-center gap-2.5 rounded-lg">
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
          </Link>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
        <nav aria-label="Principal" className="mx-auto hidden max-w-5xl gap-1 px-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item)
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] *:min-w-0 md:pb-6">
        {children}
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-zinc-50/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/90"
      >
        <ul className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500",
                    active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100",
                  )}
                >
                  <Icon size={22} weight={active ? "fill" : "regular"} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
