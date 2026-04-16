"use client";

import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: LucideIcon;
  label: string;
  rightElement?: ReactNode;
}

export function Input({
  className,
  error,
  icon: Icon,
  id,
  label,
  rightElement,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={clsx(
          "flex h-12 items-center rounded-xl border bg-input px-4 transition-colors duration-200 ease-smooth",
          error ? "border-primary" : "border-border focus-within:border-primary",
        )}
      >
        {Icon ? <Icon className="mr-3 h-4 w-4 shrink-0 text-muted" /> : null}
        <input
          id={id}
          className={clsx(
            "w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted",
            rightElement ? "pr-3" : "",
            className,
          )}
          {...props}
        />
        {rightElement ? <div className="shrink-0">{rightElement}</div> : null}
      </div>
      {error ? <p className="text-sm text-primary">{error}</p> : null}
    </div>
  );
}
