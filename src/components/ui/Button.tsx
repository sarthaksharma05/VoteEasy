"use client";

import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover",
  outline:
    "border-border bg-surface text-foreground hover:border-primary hover:text-primary",
};

export function Button({
  children,
  className,
  disabled,
  loading = false,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-border disabled:bg-[#EFEAE4] disabled:text-muted",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
