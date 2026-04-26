"use client";

import React, { useEffect, useState } from "react";
import { Check, X, FileText } from "lucide-react";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  registrationData: string | null;
}

export default function AdminApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/approvals");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("Action failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-[#666]">Loading pending applications...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-2">Admin Dashboard: Pending Approvals</h1>
        <p className="text-[15px] text-[#666] mb-8">Review and verify submitted Form 6 voter registrations.</p>

        {users.length === 0 ? (
          <div className="bg-white rounded-[10px] p-12 text-center" style={{ border: '0.5px solid #e5e5e5' }}>
            <FileText className="mx-auto text-[#e5e5e5] h-16 w-16 mb-4" />
            <h3 className="text-[18px] font-bold text-[#1a1a1a]">No Pending Applications</h3>
            <p className="text-[#666] mt-2 text-[14px]">All registrations have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => {
              const data = user.registrationData ? JSON.parse(user.registrationData) : {};
              return (
                <div key={user.id} className="bg-white rounded-[10px] p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[18px] font-bold text-[#1a1a1a]">{data.fullName || user.name}</h3>
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">Pending</span>
                    </div>
                    <p className="text-[13px] text-[#666] mb-4">{data.email || user.email} • {data.mobile}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                      <div><p className="text-[#999] mb-0.5">DOB / Age</p><p className="font-semibold text-[#1a1a1a]">{data.dob || "N/A"}</p></div>
                      <div><p className="text-[#999] mb-0.5">Gender</p><p className="font-semibold text-[#1a1a1a]">{data.gender || "N/A"}</p></div>
                      <div><p className="text-[#999] mb-0.5">Aadhaar</p><p className="font-semibold text-[#1a1a1a]">{data.aadhaar || "N/A"}</p></div>
                      <div><p className="text-[#999] mb-0.5">Relative</p><p className="font-semibold text-[#1a1a1a]">{data.familyRelativeName || "N/A"}</p></div>
                      <div className="col-span-2"><p className="text-[#999] mb-0.5">Address</p><p className="font-semibold text-[#1a1a1a]">{data.houseNo}, {data.area}, {data.city}, {data.state} - {data.pincode}</p></div>
                      <div className="col-span-2"><p className="text-[#999] mb-0.5">Documents Attached</p><p className="font-semibold text-[#1a1a1a]">{data.proofOfAgeName}, {data.proofOfAddressName}, {data.photoName}</p></div>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleAction(user.id, "REJECT")}
                      disabled={actionLoading === user.id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[8px] bg-red-50 text-red-600 px-5 py-2.5 text-[14px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <X size={18} /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(user.id, "APPROVE")}
                      disabled={actionLoading === user.id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[8px] bg-[#f05a1a] text-white px-5 py-2.5 text-[14px] font-semibold hover:bg-[#d95117] transition-colors disabled:opacity-50"
                    >
                      <Check size={18} /> Verify
                    </button>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
