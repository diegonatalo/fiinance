import Link from "next/link";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { buttonClasses } from "@/components/ui/button";

export const LandingHeader = () => (
  <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
    <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
      <BrandLink />
      <div className="ml-auto flex items-center gap-2">
        <LandingThemeToggle />
        <Link href="/app" className={buttonClasses()}>
          Abrir o painel
        </Link>
      </div>
    </div>
  </header>
);
