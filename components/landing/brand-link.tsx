import Link from "next/link";
import { BuildingsIcon } from "@phosphor-icons/react/ssr";

/** Marca do FIInance com link para a página inicial. */
export const BrandLink = () => (
  <Link href="/" aria-label="FIInance, página inicial" className="flex items-center gap-2.5 rounded-lg">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
      <BuildingsIcon size={20} />
    </span>
    <span className="text-lg font-bold tracking-tight">FIInance</span>
  </Link>
);
