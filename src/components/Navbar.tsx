import { CheckCheck, Globe, LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#2A2622] bg-[#FAF9F7] px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4622A]">
          <CheckCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
        </div>
        <Link href="/">
          <p className="text-xl font-semibold tracking-[-0.02em] text-[#1A1714]">
            Vote<span className="text-[#D4622A]">Easy</span>
          </p>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-sm font-medium text-[#8A8078] hover:text-[#1A1714] transition-colors">
          <Globe className="h-4 w-4" />
          <span>EN</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E0D8] text-sm font-semibold text-[#1A1714]">
            JS
          </div>
          <button className="text-[#8A8078] hover:text-[#D4622A] transition-colors" aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
