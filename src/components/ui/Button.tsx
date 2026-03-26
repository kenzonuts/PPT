import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-[var(--accent)] text-white hover:brightness-110 active:brightness-95 border border-[var(--accent-dim)]",
  secondary:
    "bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)]",
  ghost: "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5",
} as const;

type Variant = keyof typeof variants;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition duration-200 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
