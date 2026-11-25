import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import type { Theme } from "@/lib/theme";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === "dark" ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-fg"
    >
      {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
};
