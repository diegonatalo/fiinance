"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLink } from "@/components/brand";
import { CalculatorsIcon, DashboardIcon, PayoutsIcon, PortfolioIcon } from "@/components/nav-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/cn";
import { THEME_COLORS } from "@/lib/site";
import { THEME_KEY } from "@/lib/storage-keys";

const navItems = [
  { to: "/app", label: "Painel", end: true, icon: DashboardIcon },
  { to: "/app/carteira", label: "Carteira", end: false, icon: PortfolioIcon },
  { to: "/app/proventos", label: "Proventos", end: false, icon: PayoutsIcon },
  { to: "/app/calculadoras", label: "Calculadoras", end: false, icon: CalculatorsIcon },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { theme, toggle } = useTheme(THEME_KEY, THEME_COLORS);
  const pathname = usePathname() ?? "";
  const isActive = (item: (typeof navItems)[number]) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to);

  return (
    <div className="min-h-full bg-bg text-fg">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4 sm:px-8">
          <BrandLink />
          <nav aria-label="Principal" className="hidden flex-1 flex-wrap gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                aria-current={isActive(item) ? "page" : undefined}
                className={cn(
                  "rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive(item) ? "bg-raised text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] *:min-w-0 sm:px-8 md:pt-12 md:pb-18">
        {children}
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sunken/95 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden"
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
                    "flex min-h-13 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon />
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
