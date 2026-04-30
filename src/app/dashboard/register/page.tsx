"use client";

import { CheckCircle2, Clock, UploadCloud } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const STEPS = ["Personal Details", "Address Details", "Documents", "Review & Submit"];

const POLL_INTERVAL_MS = 30_000; // 30 seconds

function PendingStatusPoller({ onVerified }: { onVerified: () => void }) {
  const [secondsLeft, setSecondsLeft] = React.useState(10 * 60); // 10-minute countdown

  // Countdown timer — ticks every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll the server every 30s for status change
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.user?.registrationStatus === "VERIFIED") {
          onVerified();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Poll immediately in case user returns after waiting
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [onVerified]);

  return (
    <div className="mx-auto max-w-2xl text-center space-y-6 animate-in fade-in py-12">
      <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-12 w-12 text-amber-600 animate-pulse" />
      </div>
      <div>
        <h2 className="text-[28px] font-bold text-[#1a1a1a]">Application Under Review</h2>
        <p className="mt-3 text-[16px] text-[#666] max-w-md mx-auto">
          Your application has been submitted and is being automatically processed. Verification is expected within 10 minutes.
        </p>
        <p className="mt-2 text-[14px] text-[#999]">
          Auto-checking again in about {Math.max(1, Math.ceil(secondsLeft / 60))} minute(s).
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-block mt-4 rounded-[8px] bg-white border border-[#e5e5e5] px-6 py-2.5 text-[15px] font-semibold text-[#1a1a1a] hover:bg-[#fafafa] transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export default function RegisterWizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"UNREGISTERED" | "PENDING" | "VERIFIED">("UNREGISTERED");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    aadhaar: "",
    familyRelativeName: "",
    houseNo: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    constituency: "",
    durationOfStay: "",
    proofOfAgeName: "",
    proofOfAddressName: "",
    photoName: "",
    declared: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.user?.registrationStatus) {
          setStatus(data.user.registrationStatus);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Required";
    if (!formData.dob) newErrors.dob = "Required";
    if (!formData.gender) newErrors.gender = "Required";
    if (!formData.mobile) newErrors.mobile = "Required";
    if (!formData.familyRelativeName) newErrors.familyRelativeName = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.houseNo) newErrors.houseNo = "Required";
    if (!formData.area) newErrors.area = "Required";
    if (!formData.city) newErrors.city = "Required";
    if (!formData.state) newErrors.state = "Required";
    if (!formData.pincode) newErrors.pincode = "Required";
    if (!formData.constituency) newErrors.constituency = "Required";
    if (!formData.durationOfStay) newErrors.durationOfStay = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.proofOfAgeName) newErrors.proofOfAgeName = "File required";
    if (!formData.proofOfAddressName) newErrors.proofOfAddressName = "File required";
    if (!formData.photoName) newErrors.photoName = "File required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    if (currentStep === 2 && !validateStep3()) return;
    setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1));
  };
  const prevStep = () => setCurrentStep((p) => Math.max(0, p - 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file.name }));
    }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/register-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("PENDING");
      } else {
        alert("Failed to submit application");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#666]">Loading...</div>;
  }

  if (status === "PENDING") {
    return <PendingStatusPoller onVerified={() => setStatus("VERIFIED")} />;
  }

  if (status === "VERIFIED") {
    return (
      <div className="mx-auto max-w-2xl text-center space-y-6 animate-in fade-in py-12">
        <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <div>
          <h2 className="text-[28px] font-bold text-[#1a1a1a]">Registration Verified</h2>
          <p className="mt-3 text-[16px] text-[#666] max-w-md mx-auto">
            Congratulations! You are registered and verified as an eligible voter. Your EPIC card is ready.
          </p>
        </div>
        <Link href="/dashboard" className="inline-block mt-4 rounded-[8px] bg-[#f05a1a] px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-[#d95117] transition-colors">
          View Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-[28px] font-bold text-[#1a1a1a]">Register to Vote</h1>
        <p className="mt-1 text-[15px] text-[#666]">Complete your Form 6 online.</p>
      </div>

      <div className="flex items-center justify-between relative px-2">
        <div className="absolute left-0 top-1/2 -z-10 h-[2px] w-full -translate-y-1/2 bg-[#e5e5e5]"></div>
        <div 
          className="absolute left-0 top-1/2 -z-10 h-[2px] -translate-y-1/2 bg-[#f05a1a] transition-all duration-300"
          style={{ width: `${(Math.min(currentStep, STEPS.length - 1) / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={label} className="flex flex-col items-center gap-2 bg-[#f5f0eb] px-4 relative z-10">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted 
                    ? "border-[#f05a1a] bg-[#f05a1a] text-white" 
                    : isCurrent 
                      ? "border-[#f05a1a] bg-white text-[#f05a1a]" 
                      : "border-[#e5e5e5] bg-white text-[#999]"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-semibold">{index + 1}</span>}
              </div>
              <span className={`text-[12px] font-medium uppercase tracking-wider ${isCurrent || isCompleted ? "text-[#1a1a1a]" : "text-[#999]"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-[10px] bg-white p-6 md:p-8" style={{ border: '0.5px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {currentStep === 0 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-[20px] font-bold text-[#1a1a1a]">Personal Details</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[14px] font-medium text-[#666]">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#666]">Date of Birth / Age</label>
                <input name="dob" value={formData.dob} onChange={handleChange} type="date" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                {errors.dob && <span className="text-red-500 text-xs">{errors.dob}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#666]">Gender</label>
                <div className="flex items-center gap-3">
                  {["Male", "Female", "Other"].map((g) => (
                    <button key={g} type="button"
                      onClick={() => setFormData({...formData, gender: g})}
                      className={`flex-1 rounded-[8px] border py-2 text-[14px] font-medium transition-colors ${
                        formData.gender === g ? 'border-[#f05a1a] text-[#f05a1a] bg-[rgba(240,90,26,0.05)]' : 'border-[#e5e5e5] text-[#666] hover:border-[#f05a1a]'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && <span className="text-red-500 text-xs">{errors.gender}</span>}
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[14px] font-medium text-[#666]">Name of Father / Mother / Husband</label>
                <input name="familyRelativeName" value={formData.familyRelativeName} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                {errors.familyRelativeName && <span className="text-red-500 text-xs">{errors.familyRelativeName}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#666]">Mobile Number</label>
                <input name="mobile" value={formData.mobile} onChange={handleChange} type="tel" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                {errors.mobile && <span className="text-red-500 text-xs">{errors.mobile}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#666]">Email Address (Optional)</label>
                <input name="email" value={formData.email} onChange={handleChange} type="email" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[14px] font-medium text-[#666]">Aadhaar Number (Optional but helpful)</label>
                <input name="aadhaar" value={formData.aadhaar} onChange={handleChange} type="text" placeholder="XXXX-XXXX-XXXX" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="text-[20px] font-bold text-[#1a1a1a]">Address Details</h2>
             <div className="grid gap-5 md:grid-cols-2">
               <div className="flex flex-col gap-1.5 md:col-span-2">
                 <label className="text-[14px] font-medium text-[#666]">House No. / Street</label>
                 <input name="houseNo" value={formData.houseNo} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                 {errors.houseNo && <span className="text-red-500 text-xs">{errors.houseNo}</span>}
               </div>
               <div className="flex flex-col gap-1.5 md:col-span-2">
                 <label className="text-[14px] font-medium text-[#666]">Area / Locality</label>
                 <input name="area" value={formData.area} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                 {errors.area && <span className="text-red-500 text-xs">{errors.area}</span>}
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[14px] font-medium text-[#666]">City</label>
                 <input name="city" value={formData.city} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                 {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[14px] font-medium text-[#666]">State</label>
                 <select name="state" value={formData.state} onChange={handleChange} className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px] bg-white">
                    <option value="">Select State</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Puducherry">Puducherry</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                 </select>
                 {errors.state && <span className="text-red-500 text-xs">{errors.state}</span>}
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[14px] font-medium text-[#666]">PIN Code</label>
                 <input name="pincode" value={formData.pincode} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                 {errors.pincode && <span className="text-red-500 text-xs">{errors.pincode}</span>}
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-[14px] font-medium text-[#666]">Assembly Constituency</label>
                 <input name="constituency" value={formData.constituency} onChange={handleChange} type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                 {errors.constituency && <span className="text-red-500 text-xs">{errors.constituency}</span>}
               </div>
               <div className="flex flex-col gap-1.5 md:col-span-2">
                 <label className="text-[14px] font-medium text-[#666]">Duration of Stay (Years/Months)</label>
                 <input name="durationOfStay" value={formData.durationOfStay} onChange={handleChange} placeholder="e.g. 5 years" type="text" className="border border-[#e5e5e5] rounded-[8px] px-3 py-2 text-[15px]" />
                 {errors.durationOfStay && <span className="text-red-500 text-xs">{errors.durationOfStay}</span>}
               </div>
             </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="text-[20px] font-bold text-[#1a1a1a]">Documents Upload</h2>
             <p className="text-[14px] text-[#666] mb-4">Please upload the required proofs for verification.</p>
             
             <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-[#1a1a1a]">Proof of Age</label>
                  <p className="text-[12px] text-[#666]">Birth certificate, 10th marksheet, etc.</p>
                  <div className="border-2 border-dashed border-[#e5e5e5] rounded-[8px] p-4 text-center hover:border-[#f05a1a] transition-colors relative cursor-pointer">
                    <UploadCloud className="mx-auto text-[#666] mb-2" size={20} />
                    <span className="text-[13px] text-[#666]">{formData.proofOfAgeName || "Click to upload"}</span>
                    <input type="file" onChange={(e) => handleFileUpload(e, "proofOfAgeName")} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {errors.proofOfAgeName && <span className="text-red-500 text-xs">{errors.proofOfAgeName}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-[#1a1a1a]">Proof of Address</label>
                  <p className="text-[12px] text-[#666]">Aadhaar, electricity bill, etc.</p>
                  <div className="border-2 border-dashed border-[#e5e5e5] rounded-[8px] p-4 text-center hover:border-[#f05a1a] transition-colors relative cursor-pointer">
                    <UploadCloud className="mx-auto text-[#666] mb-2" size={20} />
                    <span className="text-[13px] text-[#666]">{formData.proofOfAddressName || "Click to upload"}</span>
                    <input type="file" onChange={(e) => handleFileUpload(e, "proofOfAddressName")} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {errors.proofOfAddressName && <span className="text-red-500 text-xs">{errors.proofOfAddressName}</span>}
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[14px] font-medium text-[#1a1a1a]">Passport Size Photograph</label>
                  <div className="border-2 border-dashed border-[#e5e5e5] rounded-[8px] p-4 text-center hover:border-[#f05a1a] transition-colors relative cursor-pointer">
                    <UploadCloud className="mx-auto text-[#666] mb-2" size={20} />
                    <span className="text-[13px] text-[#666]">{formData.photoName || "Click to upload"}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "photoName")} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {errors.photoName && <span className="text-red-500 text-xs">{errors.photoName}</span>}
                </div>
             </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="text-[20px] font-bold text-[#1a1a1a]">Review & Submit</h2>
             
             <div className="space-y-4 rounded-[10px] border border-[#e5e5e5] p-5 bg-[#fcfcfc]">
               <div className="grid grid-cols-2 gap-y-4 text-[14px]">
                 <div><p className="text-[#666] text-[12px] mb-1">Full Name</p><p className="font-semibold text-[#1a1a1a]">{formData.fullName}</p></div>
                 <div><p className="text-[#666] text-[12px] mb-1">Relative Name</p><p className="font-semibold text-[#1a1a1a]">{formData.familyRelativeName}</p></div>
                 <div><p className="text-[#666] text-[12px] mb-1">Date of Birth</p><p className="font-semibold text-[#1a1a1a]">{formData.dob}</p></div>
                 <div><p className="text-[#666] text-[12px] mb-1">Gender</p><p className="font-semibold text-[#1a1a1a]">{formData.gender}</p></div>
                 <div className="col-span-2"><p className="text-[#666] text-[12px] mb-1">Address</p><p className="font-semibold text-[#1a1a1a]">{formData.houseNo}, {formData.area}, {formData.city}, {formData.state} - {formData.pincode}</p></div>
                 <div><p className="text-[#666] text-[12px] mb-1">Constituency</p><p className="font-semibold text-[#1a1a1a]">{formData.constituency}</p></div>
                 <div><p className="text-[#666] text-[12px] mb-1">Duration of Stay</p><p className="font-semibold text-[#1a1a1a]">{formData.durationOfStay}</p></div>
               </div>
             </div>

             <div className="flex items-start gap-3 rounded-[10px] border border-[#e5e5e5] p-4 bg-white">
               <input type="checkbox" name="declared" checked={formData.declared} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-[#e5e5e5] accent-[#f05a1a]" id="consent" />
               <label htmlFor="consent" className="text-[14px] text-[#1a1a1a] select-none leading-tight">
                 I declare that the above information is true to the best of my knowledge.
               </label>
             </div>
          </div>
        )}

      </div>

      <div className="flex items-center justify-between pt-2 pb-12">
        <button 
          onClick={prevStep}
          disabled={currentStep === 0 || submitting}
          className="rounded-[8px] bg-white px-6 py-2.5 text-[15px] font-semibold text-[#1a1a1a] transition-colors hover:bg-[#fafafa] disabled:opacity-50 border border-[#e5e5e5]"
        >
          Back
        </button>
        
        <button 
          onClick={currentStep === 3 ? submitApplication : nextStep}
          disabled={(currentStep === 3 && !formData.declared) || submitting}
          className="rounded-[8px] bg-[#f05a1a] px-6 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#d95117] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : currentStep === 3 ? "Submit Application" : "Next"}
        </button>
      </div>

    </div>
  );
}
