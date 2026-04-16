"use client";

import clsx from "clsx";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({
  checked,
  id,
  label,
  onCheckedChange,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-3 text-sm text-foreground"
    >
      <span
        className={clsx(
          "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 ease-smooth",
          checked ? "border-primary bg-primary text-white" : "border-border bg-surface",
        )}
      >
        <Check className={clsx("h-3.5 w-3.5", checked ? "opacity-100" : "opacity-0")} />
      </span>
      <input
        id={id}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
        className="sr-only"
      />
      <span>{label}</span>
    </label>
  );
}
