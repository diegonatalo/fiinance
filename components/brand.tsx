import Link from "next/link";
import { cn } from "@/lib/cn";

/** Símbolo do FIInance: dois pilares, papel (azul) e tijolo (terracota). */
export const BrandMark = ({ size = 32, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 88 88" aria-hidden="true" className={cn("shrink-0", className)}>
    <rect x="1" y="1" width="86" height="86" rx="21" className="fill-surface stroke-line" strokeWidth="2" />
    <rect x="26" y="34" width="14" height="34" rx="4" className="fill-paper" />
    <rect x="48" y="20" width="14" height="48" rx="4" className="fill-brick" />
  </svg>
);

/** "FIInance" com os dois Is nas cores de papel e tijolo. */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn("font-semibold tracking-[-0.03em]", className)}>
    F<span className="text-paper">I</span>
    <span className="text-brick">I</span>nance
  </span>
);

/** Marca com link para a página inicial. */
export const BrandLink = ({ href = "/" }: { href?: string }) => (
  <Link href={href} aria-label="FIInance, página inicial" className="inline-flex items-center gap-2.5 rounded-lg text-fg">
    <BrandMark />
    <Wordmark className="text-[19px]" />
  </Link>
);
