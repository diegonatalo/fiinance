import { useEffect, useSyncExternalStore } from "react";
import { useLocalStorage } from "./use-local-storage";
import { THEME_KEY } from "@/lib/migration";

export type Theme = "light" | "dark";

function sanitizeTheme(raw: unknown): Theme | null {
  return raw === "dark" || raw === "light" ? raw : null;
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

function observeSystem(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** No servidor não há janela: assume claro e o navegador corrige ao hidratar. */
function useSystemTheme(): Theme {
  const dark = useSyncExternalStore(
    observeSystem,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
  return dark ? "dark" : "light";
}

export function useTheme() {
  const [stored, setTheme] = useLocalStorage<Theme | null>(
    THEME_KEY,
    null,
    sanitizeTheme,
  );
  const system = useSystemTheme();
  const theme = stored ?? system;

  // O script inline do layout aplica a classe antes do primeiro paint;
  // aqui só mantemos sincronizado quando o usuário alterna.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, toggle };
}
