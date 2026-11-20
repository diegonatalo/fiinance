import Image from "next/image";
import { SCREENSHOT } from "@/lib/landing";

/** Print do painel, no tema claro ou escuro conforme a página (classe `dark` no `<html>`). */
export const Screenshot = () => (
  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
    <Image
      src={SCREENSHOT.light}
      alt={SCREENSHOT.alt}
      width={1280}
      height={800}
      priority
      sizes="(min-width: 1024px) 992px, 100vw"
      className="block h-auto w-full dark:hidden"
    />
    <Image
      src={SCREENSHOT.dark}
      alt={SCREENSHOT.alt}
      width={1280}
      height={800}
      priority
      sizes="(min-width: 1024px) 992px, 100vw"
      className="hidden h-auto w-full dark:block"
    />
  </div>
);
