"use client";

import { CheckCircle2, FileUp, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";

const STEPS = ["Personal Info", "Address", "Documents", "Review", "Submit"];

export default function RegisterWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((p) => Math.min(4, p + 1));
  const prevStep = () => setCurrentStep((p) => Math.max(0, p - 1));

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-[28px] font-bold text-foreground">Register to Vote</h1>
        <p className="mt-1 text-sm text-muted">Complete your application securely in 5 steps.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-1/2 -z-10 h-[2px] w-full -translate-y-1/2 bg-border"></div>
        <div 
          className="absolute left-0 top-1/2 -z-10 h-[2px] -translate-y-1/2 bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={label} className="flex flex-col items-center gap-2 bg-surface-light px-2 relative z-10">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted 
                    ? "border-primary bg-primary text-white" 
                    : isCurrent 
                      ? "border-primary bg-white text-primary" 
                      : "border-border bg-white text-muted"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
              </div>
              <span className={`text-[11px] font-medium uppercase tracking-wider ${isCurrent || isCompleted ? "text-foreground" : "text-muted"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="rounded-[16px] border border-border bg-surface-white p-6 md:p-8 shadow-card min-h-[400px]">
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="font-display text-xl font-bold text-foreground">Personal Information</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">Full Name</label>
                <input type="text" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">Date of Birth</label>
                <input type="date" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-muted">Gender</label>
                <div className="flex items-center gap-3">
                  {["Male", "Female", "Other"].map((g) => (
                    <button key={g} className="flex-1 rounded-full border border-border py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">Mobile Number</label>
                <div className="flex">
                  <span className="flex items-center justify-center rounded-l-lg border border-r-0 border-border bg-surface-light px-3 text-sm text-foreground">+91</span>
                  <input type="tel" className="w-full rounded-l-none" placeholder="9876543210" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">Email Address</label>
                <input type="email" placeholder="john@example.com" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="font-display text-xl font-bold text-foreground">Address Details</h2>
             <div className="grid gap-5 md:grid-cols-2">
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-muted">State</label>
                 <select><option>Select State</option><option>Maharashtra</option><option>Delhi</option></select>
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-muted">District</label>
                 <select><option>Select District</option></select>
               </div>
               <div className="flex flex-col gap-1.5 md:col-span-2">
                 <label className="text-sm font-medium text-muted">House Number / Street</label>
                 <input type="text" placeholder="Flat No, Building, Street Name..." />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-muted">Pincode</label>
                 <input type="text" placeholder="110001" />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-muted">Residential Duration</label>
                 <select><option>Less than 1 month</option><option>More than 5 years</option></select>
               </div>
             </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center justify-between">
               <h2 className="font-display text-xl font-bold text-foreground">Document Upload</h2>
               <Link href="/dashboard/scanner" className="text-sm font-medium text-primary hover:text-primary-dark">
                 Or scan with AI &rarr;
               </Link>
             </div>
             
             <div className="grid gap-6 md:grid-cols-2 mt-4">
               <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8D2CB] p-8 text-center hover:border-primary transition-colors cursor-pointer bg-surface-card">
                 <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                   <FileUp className="h-6 w-6 text-primary" />
                 </div>
                 <p className="font-medium text-foreground text-sm">Proof of Age</p>
                 <p className="mt-1 text-xs text-muted">Drag & drop or click to upload</p>
                 <p className="mt-2 text-[11px] text-muted">(Aadhaar / Birth Certificate / Passport)</p>
               </div>
               
               <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8D2CB] p-8 text-center hover:border-primary transition-colors cursor-pointer bg-surface-card">
                 <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                   <FileUp className="h-6 w-6 text-primary" />
                 </div>
                 <p className="font-medium text-foreground text-sm">Proof of Address</p>
                 <p className="mt-1 text-xs text-muted">Drag & drop or click to upload</p>
                 <p className="mt-2 text-[11px] text-muted">(Aadhaar / Utility Bill / Rental Agreement)</p>
               </div>
             </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="font-display text-xl font-bold text-foreground">Review Application</h2>
             
             <div className="space-y-4 rounded-xl border border-border p-5 bg-surface-light">
               <div className="flex items-center justify-between border-b border-border pb-3">
                 <h3 className="font-semibold text-foreground text-sm">Personal Info</h3>
                 <button className="text-xs font-semibold text-primary" onClick={() => setCurrentStep(0)}>Edit</button>
               </div>
               <div className="grid grid-cols-2 gap-y-4 text-sm">
                 <div><p className="text-muted text-xs">Name</p><p className="font-medium">John Doe</p></div>
                 <div><p className="text-muted text-xs">Gender</p><p className="font-medium">Male</p></div>
                 <div><p className="text-muted text-xs">Mobile Number</p><p className="font-medium">+91 9876543210</p></div>
               </div>
             </div>

             <div className="flex items-center gap-3 rounded-lg border border-border p-4 bg-white">
               <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary" id="consent" />
               <label htmlFor="consent" className="text-sm font-medium text-foreground select-none">
                 I confirm the above information is accurate
               </label>
             </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-500 py-10">
             <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-2">
               <CheckCircle2 className="h-12 w-12 text-green-600" />
             </div>
             
             <div>
               <h2 className="font-display text-3xl font-bold text-foreground">Application Submitted!</h2>
               <p className="mt-2 text-sm text-foreground">Reference ID: <span className="font-mono bg-surface-light px-2 py-1 rounded font-bold tracking-widest text-[#E8510A] ml-1">VE-9034-2198</span></p>
             </div>
             
             <div className="max-w-md bg-surface-light border border-border rounded-xl p-5 text-left w-full mx-auto my-6">
               <p className="font-semibold text-sm mb-3">Next Steps:</p>
               <ol className="space-y-3">
                 <li className="flex gap-3 text-sm"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-xs text-white">1</span> Document verification by BLO details will be sent to your mobile.</li>
                 <li className="flex gap-3 text-sm"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-xs text-white">2</span> Booth Level Officer home visit within 14 days.</li>
               </ol>
             </div>

             <div className="flex items-center gap-4 w-full max-w-md">
               <button className="flex-1 rounded-lg border-1.5 border-border py-3 text-sm font-semibold text-foreground hover:bg-surface-light transition-colors">Download PDF Receipt</button>
               <Link href="/dashboard" className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors flex items-center justify-center">Go to Dashboard</Link>
             </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between border-t border-border pt-6 pb-12">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="rounded-lg border-[1.5px] border-border bg-white px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button 
            onClick={nextStep}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {currentStep === 3 ? "Submit Application" : "Continue"}
          </button>
        </div>
      )}

    </div>
  );
}
