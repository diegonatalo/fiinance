import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary: "bg-fg font-semibold text-bg hover:opacity-90",
  outline: "border border-line-strong font-medium text-fg hover:bg-raised",
  ghost: "text-muted hover:bg-raised hover:text-fg",
  danger: "text-muted hover:bg-down/10 hover:text-down",
};

const sizes: Record<Size, string> = {
  md: "h-11 rounded-xl px-5 text-[15px]",
  lg: "h-13 rounded-[14px] px-6 text-base",
  icon: "size-10 rounded-[10px]",
};

/** Classes do botão, também usadas em links com aparência de botão. */
export const buttonClasses = (variant: Variant = "primary", className?: string, size: Size = "md") =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

export const Button = ({ children, variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) => {
  return (
    <button type={type} className={buttonClasses(variant, className, size)} {...props}>
      {children}
    </button>
  );
};
