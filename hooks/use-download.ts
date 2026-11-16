import { useCallback } from "react";

/** Baixa um texto como arquivo no navegador. */
export function useDownload() {
  return useCallback((name: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
}
