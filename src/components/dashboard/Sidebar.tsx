"use client";

import {
  Bot,
  CalendarDays,
  CheckCheck,
  FileCheck2,
  HelpCircle,
  Home,
  LogOut,
  ScanLine,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/register", icon: FileCheck2, label: "Register to Vote" },
  { href: "/dashboard/eligibility", icon: CheckCheck, label: "Check Eligibility" },
  { href: "/dashboard/scanner", icon: ScanLine, label: "ID Scanner" },
  { href: "/dashboard/deadlines", icon: CalendarDays, label: "Election Deadlines" },
  { href: "/dashboard/assistant", icon: Bot, label: "AI Assistant" },
  { href: "/dashboard/documents", icon: FileCheck2, label: "My Documents" },
  { href: "/dashboard/help", icon: HelpCircle, label: "Help & Guide" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[260px] flex-col bg-surface-dark md:flex border-r border-[#2A2A2A]">
      <div className="flex h-16 items-center px-6 pt-6 mb-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <CheckCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <p className="font-display text-xl font-bold tracking-[-0.02em] text-white">
            Vote<span className="text-primary">Easy</span>
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[rgba(232,81,10,0.10)] text-primary border-l-[3px] border-primary"
                  : "text-[rgba(255,255,255,0.55)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.85)] border-l-[3px] border-transparent"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(255,255,255,0.08)] p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.55)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.85)] border-l-[3px] border-transparent">
          <Settings className="h-5 w-5 flex-shrink-0" />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[rgba(255,255,255,0.55)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-red-400 border-l-[3px] border-transparent mt-1">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
