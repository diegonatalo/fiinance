import { BrandMark } from "@/components/brand";

/** Enquanto o servidor confere a sessão e carrega a carteira. */
export const AppLoading = () => (
  <div role="status" className="grid min-h-dvh place-items-center bg-bg text-muted">
    <div className="flex flex-col items-center gap-3">
      <BrandMark size={48} className="animate-pulse" />
      <span className="text-sm font-medium">Carregando sua carteira…</span>
    </div>
  </div>
);
