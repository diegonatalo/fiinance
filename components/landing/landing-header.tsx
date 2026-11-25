import Link from "next/link";
import { BrandLink } from "@/components/brand";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { buttonClasses } from "@/components/ui/button";

const SECTIONS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/#perguntas", label: "Perguntas" },
];

/** Cabeçalho da landing e das páginas legais. */
export const LandingHeader = ({ sections = true }: { sections?: boolean }) => (
  <header className="border-b border-hairline">
    <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
      <div className="flex-1">
        <BrandLink />
      </div>
      {sections && (
        <nav aria-label="Seções da página" className="hidden gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className="px-3 py-2.5 text-sm font-medium text-muted hover:text-fg">
              {s.label}
            </a>
          ))}
        </nav>
      )}
      <div className="flex items-center gap-2">
        <LandingThemeToggle />
        <Link href="/app" className={buttonClasses("primary", "px-[18px]")}>
          Abrir o app
        </Link>
      </div>
    </div>
  </header>
);
