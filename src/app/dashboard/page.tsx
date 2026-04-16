"use client";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  FileCheck2,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// StatCard component
function StatCard({ label, value, subtext, accentColor, icon: Icon }: any) {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-[#EDE8E3]"
         style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
      {/* Left accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
           style={{ background: accentColor }} />

      {/* Watermark icon */}
      <div className="absolute top-3 right-3 opacity-[0.06]">
        <Icon size={48} />
      </div>

      <div className="pl-6 pr-5 pt-5 pb-4">
        {/* Label */}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9B8F85] mb-2 font-body">
          {label}
        </p>

        {/* Value */}
        <p className="text-[32px] font-bold text-[#1A1A1A] font-display leading-none mb-1">
          {value}
        </p>

        {/* Subtext */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: accentColor }} />
          <span className="text-[12px] text-[#7A6F66] font-body">{subtext}</span>
        </div>
      </div>
    </div>
  );
}

// QuickActionCard component
function QuickActionCard({ title, description, icon: Icon, href }: any) {
  return (
    <Link href={href}>
      <div className="group bg-white rounded-2xl p-6 border border-[#EDE8E3] cursor-pointer transition-all duration-200 hover:-translate-y-[2px]"
           style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

        {/* Icon container */}
        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
             style={{
               background: 'linear-gradient(135deg, #FEF0E8 0%, #FDE4D3 100%)',
               border: '1px solid rgba(232,81,10,0.12)'
             }}>
          <Icon size={22} color="#E8510A" strokeWidth={1.8} />
        </div>

        {/* Title */}
        <h3 className="font-display text-[16px] font-semibold text-[#1A1A1A] mb-1">
          {title}
        </h3>

        {/* Description */}
        <p className="font-body text-[13px] text-[#9B8F85] leading-relaxed mb-4">
          {description}
        </p>

        {/* Bottom arrow row */}
        <div className="flex items-center gap-1 text-[#E8510A] text-[13px] font-semibold font-body opacity-0 group-hover:opacity-100 transition-opacity duration-150 -mb-1">
          Get started
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// DeadlineRow component
function DeadlineRow({ state, type, date, days }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0EBE5] last:border-0">
      <div>
        <p className="font-display text-[14px] font-semibold text-[#1A1A1A]">{state}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-[#9B8F85] bg-[#F5F0EB] px-2 py-0.5 rounded-md font-body">
            {type}
          </span>
          <span className="text-[11px] text-[#9B8F85] font-body">{date}</span>
        </div>
      </div>

      {/* Days pill */}
      <span className="text-[12px] font-bold px-3 py-1.5 rounded-lg font-body"
            style={
              days <= 20  ? { background: '#FEE2E2', color: '#DC2626' } :
              days <= 60  ? { background: '#FEF3C7', color: '#D97706' } :
                            { background: '#DCFCE7', color: '#16A34A' }
            }>
        {days} days
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rely on http-only cookies sent automatically by browser instead of localstorage jwt parsing
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        if (data?.user?.name) {
          setUserName(data.user.name.split(" ")[0]);
        }
      })
      .catch((e) => console.error("Could not fetch user info.", e))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-8 text-sm text-muted">Loading your dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Top Stats Row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Registration Status" 
          value="Verified" 
          subtext="Voter ID Active"
          accentColor="#22C55E"
          icon={ShieldCheck} 
        />
        <StatCard 
          label="Days Until Deadline" 
          value="47 Days" 
          subtext="Gujarat 2025"
          accentColor="#E8510A"
          icon={CalendarDays} 
        />
        <StatCard 
          label="Documents Scanned" 
          value="3 Docs" 
          subtext="Aadhaar + more"
          accentColor="#3B82F6"
          icon={FileCheck2} 
        />
        <StatCard 
          label="AI Queries Today" 
          value="12 Chats" 
          subtext="All answered"
          accentColor="#8B5CF6"
          icon={Bot} 
        />
      </section>

      {/* Welcome Banner */}
      <section>
        <div className="relative rounded-2xl overflow-hidden"
             style={{
               background: 'linear-gradient(135deg, #1A1A1A 0%, #252525 60%, #2A2118 100%)',
               boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
             }}>
          {/* Decorative orange glow blob */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.07]"
               style={{
                 background: 'radial-gradient(circle, #E8510A 0%, transparent 70%)',
                 transform: 'translate(30%, -30%)'
               }} />

          {/* Decorative grid texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 40px)'
               }} />

          <div className="relative z-10 px-8 py-7">
            <h2 className="font-display text-[28px] font-bold text-white mb-1">
              Welcome back,{' '}
              <span style={{ color: '#E8510A' }}>{userName}</span>
            </h2>

            <p className="font-body text-[14px] mb-5"
               style={{ color: 'rgba(255,255,255,0.55)' }}>
              Your voter registration journey is 80% complete.
            </p>

            <div className="flex items-center gap-4">
              <span className="font-body text-[12px]"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>Start</span>
              <div className="flex-1 h-2 rounded-full"
                   style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-2 rounded-full transition-all duration-700"
                     style={{
                       width: '80%',
                       background: 'linear-gradient(90deg, #E8510A 0%, #F5701A 100%)',
                       boxShadow: '0 0 12px rgba(232,81,10,0.5)'
                     }} />
              </div>
              <span className="font-body text-[13px] font-semibold"
                    style={{ color: '#E8510A' }}>80%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Below */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left (60%) - Quick Actions */}
        <section className="space-y-4 lg:col-span-7 xl:col-span-8">
          <h3 className="font-display text-lg font-bold text-foreground">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuickActionCard 
              title="Register Now" 
              description="Complete your Form 6 online." 
              icon={FileCheck2} 
              href="/dashboard/register" 
            />
            <QuickActionCard 
              title="Scan Your ID" 
              description="Auto-fill data from Aadhaar." 
              icon={ScanLine} 
              href="/dashboard/scanner" 
            />
            <QuickActionCard 
              title="Check Eligibility" 
              description="See if you qualify to vote." 
              icon={ShieldCheck} 
              href="/dashboard/eligibility" 
            />
            <QuickActionCard 
              title="Track Deadlines" 
              description="View upcoming election dates." 
              icon={CalendarDays} 
              href="/dashboard/deadlines" 
            />
          </div>
        </section>

        {/* Right (40%) - Upcoming Deadlines */}
        <section className="flex flex-col lg:col-span-5 xl:col-span-4">
          <div className="flex flex-1 flex-col rounded-[16px] border border-border bg-surface-white p-5 shadow-card h-full">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5" color="#E8510A" />
              <h3 className="font-display text-lg font-bold text-[#1A1A1A]">Upcoming Deadlines</h3>
            </div>
            
            <div className="flex-1 space-y-1">
              <DeadlineRow state="Gujarat" type="State Assembly" date="Oct 15, 2024" days={12} />
              <DeadlineRow state="Maharashtra" type="State Assembly" date="Nov 20, 2024" days={47} />
              <DeadlineRow state="Delhi" type="State Assembly" date="Feb 12, 2025" days={93} />
            </div>

            <Link href="/dashboard/deadlines" className="mt-4 inline-block text-[13px] font-semibold text-primary hover:text-primary-dark transition-colors font-body">
              View All Deadlines &rarr;
            </Link>
          </div>
        </section>
      </div>

    </div>
  );
}
