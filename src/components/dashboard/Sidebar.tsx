"use client";

import {
  Bot,
  CalendarDays,
  CheckCheck,
  FileText,
  FolderOpen,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Overview" },
  { href: "/dashboard/register", icon: FileText, label: "Register to Vote" },
  { href: "/dashboard/eligibility", icon: CheckCheck, label: "Check Eligibility" },
  { href: "/dashboard/deadlines", icon: CalendarDays, label: "Election Deadlines" },
  { href: "/dashboard/assistant", icon: Bot, label: "AI Assistant" },
  { href: "/dashboard/documents", icon: FolderOpen, label: "My Documents" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[220px] flex-col bg-[#1a1a1a] md:flex">
      <div className="flex h-16 items-center px-6 pt-6 mb-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <CheckCheck className="h-4 w-4 text-white" strokeWidth={3} />
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
                  ? "bg-[rgba(240,90,26,0.15)] text-primary border-l-[2px] border-primary"
                  : "text-[#999999] hover:bg-[#222] hover:text-[#dddddd] border-l-[2px] border-transparent"
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#2a2a2a] p-3">
        <Link 
          href="/dashboard/settings"
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/dashboard/settings"
              ? "bg-[rgba(240,90,26,0.15)] text-primary border-l-[2px] border-primary"
              : "text-[#999999] hover:bg-[#222] hover:text-[#dddddd] border-l-[2px] border-transparent"
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#999999] transition-colors hover:bg-[#222] hover:text-red-400 border-l-[2px] border-transparent mt-1">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
