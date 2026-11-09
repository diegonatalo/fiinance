import { useEffect, useSyncExternalStore } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { CHAVE_TEMA } from "../lib/migracao";

export type Theme = "light" | "dark";

function sanitizarTema(raw: unknown): Theme | null {
  return raw === "dark" || raw === "light" ? raw : null;
}

const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

function observarSistema(onChange: () => void) {
  const consulta = window.matchMedia(CONSULTA_ESCURO);
  consulta.addEventListener("change", onChange);
  return () => consulta.removeEventListener("change", onChange);
}

/** No servidor não há janela: assume claro e o navegador corrige ao hidratar. */
function useTemaDoSistema(): Theme {
  const escuro = useSyncExternalStore(
    observarSistema,
    () => window.matchMedia(CONSULTA_ESCURO).matches,
    () => false,
  );
  return escuro ? "dark" : "light";
}

export function useTheme() {
  const [stored, setTheme] = useLocalStorage<Theme | null>(
    CHAVE_TEMA,
    null,
    sanitizarTema,
  );
  const sistema = useTemaDoSistema();
  const theme = stored ?? sistema;

  // O script inline do layout aplica a classe antes do primeiro paint;
  // aqui só mantemos sincronizado quando o usuário alterna.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, toggle };
}
