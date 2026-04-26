"use client";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  accentColor: string;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

interface DeadlineItemProps {
  state: string;
  type: string;
  date: string;
  days: number;
}

interface DashboardUser {
  name: string;
}

interface DashboardStat {
  label: string;
  value: string;
}

function StatCard({ label, value, subtext, accentColor }: StatCardProps) {
  return (
    <div className="relative bg-white rounded-[10px] overflow-hidden p-4"
         style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: accentColor }} />
      <p className="text-[12px] font-semibold text-[#666] mb-1 mt-2 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[28px] font-bold text-[#1a1a1a] mb-1 leading-tight">
        {value}
      </p>
      <p className="text-[13px] text-[#666]">
        {subtext}
      </p>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, href }: ActionCardProps) {
  return (
    <Link href={href} className="block h-full">
      <div className="group bg-white rounded-[10px] p-6 h-full transition-all hover:bg-[#fafafa]"
           style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(240,90,26,0.1)] mb-4">
          <Icon size={20} color="#f05a1a" />
        </div>
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">{title}</h3>
        <p className="text-[14px] text-[#666] mb-4">{description}</p>
        <div className="flex items-center gap-1 text-[#f05a1a] text-[14px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          Get started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function DeadlineItem({ state, type, date, days }: DeadlineItemProps) {
  let badgeClass = "bg-green-100 text-green-700";
  if (days <= 14) badgeClass = "bg-red-100 text-red-700";
  else if (days <= 45) badgeClass = "bg-amber-100 text-amber-700";

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#e5e5e5] last:border-0">
      <div>
        <p className="text-[14px] font-semibold text-[#1a1a1a]">{state}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-[#666] bg-[#f5f0eb] px-1.5 py-0.5 rounded">{type}</span>
          <span className="text-[12px] text-[#666]">{date}</span>
        </div>
      </div>
      <span className={`text-[12px] font-bold px-2 py-1 rounded-md ${badgeClass}`}>
        {days} days
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStat[] | null>(null);
  const [user, setUser] = React.useState<DashboardUser | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        if (data.stats) setStats(data.stats);
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label={stats?.[0]?.label || "Registration Status"} 
          value={stats?.[0]?.value || "Loading"} 
          subtext="• Voter ID Status"
          accentColor="#22c55e"
        />
        <StatCard 
          label="Days Until Deadline" 
          value="47 Days" 
          subtext="• Maharashtra 2024"
          accentColor="#f05a1a"
        />
        <StatCard 
          label="Documents Scanned" 
          value={stats?.[1]?.value || "3 Docs"} 
          subtext="• Aadhaar + more"
          accentColor="#3b82f6"
        />
        <StatCard 
          label="AI Queries Today" 
          value={stats?.[2]?.value || "Loading"} 
          subtext="• All answered"
          accentColor="#8b5cf6"
        />
      </section>

      <section>
        <div className="bg-[#1a1a1a] rounded-[10px] p-6 lg:p-8"
             style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 className="text-[24px] font-bold text-white mb-2">
            Welcome back, <span style={{ color: '#f05a1a' }}>{user?.name || 'Voter'}</span>
          </h2>
          <p className="text-[15px] text-[#ccc] mb-6">
            Your voter registration journey is 80% complete.
          </p>
          <div className="flex flex-col gap-2">
            <div className="w-full bg-[#333] h-2 rounded-full overflow-hidden">
              <div className="bg-[#f05a1a] h-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          title="Register Now" 
          description="Complete your Form 6 online." 
          icon={FileCheck2} 
          href="/dashboard/register" 
        />
        <ActionCard 
          title="AI Assistant" 
          description="Ask anything about voting." 
          icon={Bot} 
          href="/dashboard/assistant" 
        />
        <div className="bg-white rounded-[10px] p-5 h-full flex flex-col"
             style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} color="#f05a1a" />
            <h3 className="text-[16px] font-semibold text-[#1a1a1a]">Upcoming Deadlines</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <DeadlineItem state="Gujarat" type="State Assembly" date="Oct 15, 2024" days={12} />
            <DeadlineItem state="Maharashtra" type="State Assembly" date="Nov 20, 2024" days={47} />
          </div>
        </div>
      </section>
    </div>
  );
}
