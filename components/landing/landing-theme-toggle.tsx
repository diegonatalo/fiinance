"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/hooks/use-theme";
import { THEME_COLORS } from "@/lib/site";
import { THEME_KEY } from "@/lib/storage-keys";

/** Troca de tema fora do app (landing e páginas legais). */
export const LandingThemeToggle = () => {
  const { theme, toggle } = useTheme(THEME_KEY, THEME_COLORS);
  return <ThemeToggle theme={theme} onToggle={toggle} />;
};
