"use client";

import React, { useState } from "react";
import { Bell, BellRing, CalendarDays } from "lucide-react";

const upcomingDeadlines = [
  { id: 1, state: "Gujarat", type: "State Assembly", date: "Oct 15, 2024", days: 12 },
  { id: 2, state: "Maharashtra", type: "State Assembly", date: "Nov 20, 2024", days: 47 },
  { id: 3, state: "Jharkhand", type: "State Assembly", date: "Nov 23, 2024", days: 50 },
  { id: 4, state: "Delhi", type: "State Assembly", date: "Feb 5, 2025", days: 124 },
  { id: 5, state: "Bihar", type: "State Assembly", date: "Oct 2025", days: 365 },
];

const pastDeadlines = [
  { id: 6, state: "Karnataka", type: "State Assembly", date: "May 10, 2023", days: -500 },
  { id: 7, state: "Telangana", type: "State Assembly", date: "Nov 30, 2023", days: -300 },
];

interface DeadlineItem {
  id: number;
  state: string;
  type: string;
  date: string;
  days: number;
}

function DeadlineCard({ item }: { item: DeadlineItem }) {
  const [reminder, setReminder] = useState(false);

  let badgeClass = "bg-green-100 text-green-700";
  if (item.days <= 14 && item.days >= 0) badgeClass = "bg-red-100 text-red-700";
  else if (item.days <= 45 && item.days >= 0) badgeClass = "bg-amber-100 text-amber-700";
  else if (item.days < 0) badgeClass = "bg-[#e5e5e5] text-[#666]";

  return (
    <div className="bg-white rounded-[10px] p-5" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[18px] font-bold text-[#1a1a1a]">{item.state}</h3>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#666] bg-[#f5f0eb] px-2 py-1 rounded">
              {item.type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#666] text-[14px]">
            <CalendarDays size={16} />
            <span>{item.date}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-md font-bold text-[13px] ${badgeClass}`}>
            {item.days < 0 ? 'Concluded' : `${item.days} days left`}
          </div>
          
          {item.days >= 0 && (
            <button 
              onClick={() => setReminder(!reminder)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-medium transition-colors border ${
                reminder 
                  ? "border-[#f05a1a] text-[#f05a1a] bg-[rgba(240,90,26,0.05)]" 
                  : "border-[#e5e5e5] text-[#666] hover:bg-[#fafafa]"
              }`}
            >
              {reminder ? <BellRing size={16} /> : <Bell size={16} />}
              {reminder ? "Reminder Set ✓" : "Set Reminder"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeadlinesPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const deadlines = tab === "upcoming" ? upcomingDeadlines : pastDeadlines;

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1a1a]">Election Deadlines</h1>
        <p className="mt-1 text-[15px] text-[#666]">Track upcoming voter registration and election dates.</p>
      </div>

      <div className="flex gap-2 p-1 bg-[#e5e5e5] rounded-[10px] w-max">
        <button 
          onClick={() => setTab("upcoming")}
          className={`px-6 py-2 rounded-[8px] text-[14px] font-semibold transition-colors ${
            tab === "upcoming" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#666] hover:text-[#1a1a1a]"
          }`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setTab("past")}
          className={`px-6 py-2 rounded-[8px] text-[14px] font-semibold transition-colors ${
            tab === "past" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#666] hover:text-[#1a1a1a]"
          }`}
        >
          Past
        </button>
      </div>

      <div className="space-y-4">
        {deadlines.map(d => (
          <DeadlineCard key={d.id} item={d} />
        ))}
      </div>
    </div>
  );
}
