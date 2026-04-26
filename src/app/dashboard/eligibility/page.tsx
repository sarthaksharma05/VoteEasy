"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function EligibilityPage() {
  const [dob, setDob] = useState("");
  const [citizenship, setCitizenship] = useState<"Indian" | "Other" | "">("");
  const [residence, setResidence] = useState<"Resident" | "NonResident" | "">("");
  const [soundMind, setSoundMind] = useState(false);
  const [notDisqualified, setNotDisqualified] = useState(false);

  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const age = calculateAge(dob);
  
  const results = useMemo(() => {
    return {
      agePass: age !== null && age >= 18,
      citizenshipPass: citizenship === "Indian",
      residencePass: residence === "Resident",
      soundMindPass: soundMind,
      notDisqualifiedPass: notDisqualified
    };
  }, [age, citizenship, residence, soundMind, notDisqualified]);

  const isComplete = dob !== "" && citizenship !== "" && residence !== "";
  
  const failedCriteria = [];
  if (isComplete) {
    if (!results.agePass) failedCriteria.push("You must be at least 18 years old.");
    if (!results.citizenshipPass) failedCriteria.push("You must be an Indian citizen.");
    if (!results.residencePass) failedCriteria.push("You must be an ordinary resident of your constituency.");
    if (!results.soundMindPass) failedCriteria.push("You must declare that you are of sound mind.");
    if (!results.notDisqualifiedPass) failedCriteria.push("You must not be disqualified by a court of law.");
  }

  const isEligible = isComplete && failedCriteria.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1a1a]">Check Eligibility</h1>
        <p className="mt-1 text-[15px] text-[#666]">See if you qualify to register as a voter in India.</p>
      </div>

      <div className="space-y-4">
        {/* Age Card */}
        <div className="bg-white rounded-[10px] p-6" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">1. Age Requirement</h3>
              <p className="text-[14px] text-[#666] mb-4">You must be at least 18 years old.</p>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
            </div>
            {dob && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${results.agePass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {results.agePass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span className="text-[13px] font-semibold">{results.agePass ? 'Pass' : 'Fail'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Citizenship Card */}
        <div className="bg-white rounded-[10px] p-6" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">2. Citizenship</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="citizenship" checked={citizenship === "Indian"} onChange={() => setCitizenship("Indian")} className="accent-[#f05a1a] w-4 h-4" />
                  <span className="text-[15px] text-[#1a1a1a]">Indian Citizen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="citizenship" checked={citizenship === "Other"} onChange={() => setCitizenship("Other")} className="accent-[#f05a1a] w-4 h-4" />
                  <span className="text-[15px] text-[#1a1a1a]">Not a Citizen</span>
                </label>
              </div>
            </div>
            {citizenship && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${results.citizenshipPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {results.citizenshipPass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span className="text-[13px] font-semibold">{results.citizenshipPass ? 'Pass' : 'Fail'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Residence Card */}
        <div className="bg-white rounded-[10px] p-6" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-2">3. Residence</h3>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="residence" checked={residence === "Resident"} onChange={() => setResidence("Resident")} className="accent-[#f05a1a] w-4 h-4" />
                  <span className="text-[15px] text-[#1a1a1a]">Ordinary resident of constituency</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="residence" checked={residence === "NonResident"} onChange={() => setResidence("NonResident")} className="accent-[#f05a1a] w-4 h-4" />
                  <span className="text-[15px] text-[#1a1a1a]">Not a resident</span>
                </label>
              </div>
            </div>
            {residence && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${results.residencePass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {results.residencePass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span className="text-[13px] font-semibold">{results.residencePass ? 'Pass' : 'Fail'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Competency Card */}
        <div className="bg-white rounded-[10px] p-6" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
           <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">4. Additional Criteria</h3>
           <div className="space-y-3">
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="checkbox" checked={soundMind} onChange={(e) => setSoundMind(e.target.checked)} className="accent-[#f05a1a] w-5 h-5 rounded border-[#e5e5e5]" />
               <span className="text-[15px] text-[#1a1a1a]">I am of sound mind</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="checkbox" checked={notDisqualified} onChange={(e) => setNotDisqualified(e.target.checked)} className="accent-[#f05a1a] w-5 h-5 rounded border-[#e5e5e5]" />
               <span className="text-[15px] text-[#1a1a1a]">I have not been disqualified by a court</span>
             </label>
           </div>
        </div>
      </div>

      {isComplete && (
        <div className={`rounded-[10px] p-6 animate-in fade-in zoom-in-95 ${isEligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {isEligible ? (
            <div className="flex items-center gap-4">
              <CheckCircle2 className="text-green-600 w-10 h-10" />
              <div>
                <h3 className="text-[20px] font-bold text-green-800">You are eligible to vote!</h3>
                <p className="text-[14px] text-green-700 mt-1">You meet all the criteria to register as a voter.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <XCircle className="text-red-600 w-10 h-10 shrink-0" />
              <div>
                <h3 className="text-[20px] font-bold text-red-800">You may not be eligible</h3>
                <ul className="list-disc list-inside mt-2 text-[14px] text-red-700 space-y-1">
                  {failedCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
