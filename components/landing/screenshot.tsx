import Image from "next/image";
import { SCREENSHOT } from "@/lib/landing";

/** Print do painel, no tema claro ou escuro conforme a página (classe `dark` no `<html>`). */
export const Screenshot = () => (
  <div className="overflow-hidden rounded-[18px] border border-hairline bg-bg">
    <Image
      src={SCREENSHOT.light}
      alt={SCREENSHOT.alt}
      width={1280}
      height={800}
      sizes="(min-width: 1200px) 1128px, 100vw"
      className="block h-auto w-full dark:hidden"
    />
    <Image
      src={SCREENSHOT.dark}
      alt={SCREENSHOT.alt}
      width={1280}
      height={800}
      sizes="(min-width: 1200px) 1128px, 100vw"
      className="hidden h-auto w-full dark:block"
    />
  </div>
);
