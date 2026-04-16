import { LucideIcon } from "lucide-react";
import React from "react";

interface FeatureCardProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function FeatureCard({ description, icon: Icon, title }: FeatureCardProps) {
  return (
    <div className="group flex flex-col rounded-xl border border-[#D1CCC5] bg-white p-6 transition-colors hover:bg-[#F4F1ED]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#D1CCC5] bg-[#FAF9F7]">
        <Icon className="h-6 w-6 text-[#D4622A]" strokeWidth={2} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[#1A1714]">{title}</h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-[#5F5851]">
        {description}
      </p>
      <button className="flex w-full items-center justify-center rounded-lg border border-[#D1CCC5] bg-transparent py-2.5 text-sm font-medium text-[#1A1714] transition-colors group-hover:border-[#1A1714]">
        Open
      </button>
    </div>
  );
}
