"use client";

import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, AlertTriangle, Loader2 } from "lucide-react";

import {
  AppTheme,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_THEME,
  NotificationPreferences,
  getStoredTheme,
} from "@/lib/indian-languages";

interface ProfileState {
  name: string;
  email: string;
  mobile: string;
  profilePhoto: string;
}

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const STORAGE_THEME_KEY = "voteeasy-theme";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    email: "",
    mobile: "",
    profilePhoto: "",
  });
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [preferences, setPreferences] = useState({
    theme: DEFAULT_THEME as AppTheme,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const initials = useMemo(() => {
    const name = profile.name.trim();
    if (!name) return "VE";
    const parts = name.split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
  }, [profile.name]);

  const isDark = preferences.theme === "Dark";
  const panelClass = isDark
    ? "bg-[#171a1d] border border-[#303743] shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
    : "bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.06)]";
  const mutedTextClass = isDark ? "text-[#a4acb6]" : "text-[#666]";
  const titleClass = isDark ? "text-white" : "text-[#1a1a1a]";
  const fieldClass = isDark
    ? "border border-[#434c5b] bg-[#111418] text-white rounded-[8px] px-3 py-2 text-[15px]"
    : "border border-[#e5e5e5] bg-white text-[#1a1a1a] rounded-[8px] px-3 py-2 text-[15px]";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings", { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = await response.json();
        setProfile(data.profile);
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...data.notifications });
        setPreferences({
          theme: getStoredTheme(data.preferences?.theme),
        });
      } catch (error) {
        console.error(error);
        setStatus({ type: "error", message: "Unable to load your settings right now." });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_THEME_KEY, preferences.theme);
    document.documentElement.dataset.theme = preferences.theme.toLowerCase();
    document.body.dataset.theme = preferences.theme.toLowerCase();
    window.dispatchEvent(new Event("voteeasy-settings-updated"));
  }, [preferences.theme]);

  const saveSettings = async (
    payload: Partial<ProfileState> & {
      theme?: AppTheme;
      notifications?: NotificationPreferences;
    },
    section: string,
    successMessage: string,
  ) => {
    setSavingSection(section);
    setStatus(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...profile,
          theme: preferences.theme,
          notifications,
          ...payload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setProfile(data.profile);
      setNotifications({ ...DEFAULT_NOTIFICATIONS, ...data.notifications });
      setPreferences({
        theme: getStoredTheme(data.preferences.theme),
      });
      setStatus({ type: "success", message: successMessage });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save settings.",
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please upload a valid image file." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: "error", message: "Profile photo must be 2MB or smaller." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, profilePhoto: typeof reader.result === "string" ? reader.result : prev.profilePhoto }));
      setStatus({ type: "success", message: "Photo selected. Save changes to keep it." });
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordUpdate = async () => {
    setSavingSection("password");
    setStatus(null);

    try {
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(passwordForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setStatus({ type: "success", message: data.message });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update password.",
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handleDeleteAccount = async () => {
    setSavingSection("delete");
    setStatus(null);

    try {
      const response = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      window.localStorage.removeItem(STORAGE_THEME_KEY);
      window.location.href = "/login";
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete account.",
      });
      setSavingSection(null);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#f05a1a]" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className={`text-[28px] font-bold ${titleClass}`}>Settings</h1>
        <p className={`mt-1 text-[15px] ${mutedTextClass}`}>Manage your account preferences and configurations.</p>
      </div>

      {status && (
        <div
          className={`rounded-[10px] px-4 py-3 text-[14px] ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className={`rounded-[10px] ${panelClass}`}>
        <div className="p-6 md:p-8 border-b border-[#e5e5e5]">
          <h2 className={`text-[18px] font-bold mb-6 ${titleClass}`}>Profile</h2>

          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-[#e5e5e5]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#f05a1a] flex items-center justify-center text-white text-[24px] font-bold">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-[#e5e5e5] shadow-sm hover:bg-[#fafafa] transition-colors"
              >
                <Camera size={14} color="#666" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div>
              <p className={`text-[16px] font-semibold ${titleClass}`}>Profile Photo</p>
              <p className={`text-[13px] ${mutedTextClass}`}>JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 mb-6">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className={`text-[14px] font-medium ${mutedTextClass}`}>Full Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} type="text" className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-[14px] font-medium ${mutedTextClass}`}>Email Address</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`text-[14px] font-medium ${mutedTextClass}`}>Mobile Number</label>
              <input value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} type="tel" className={fieldClass} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => saveSettings({}, "profile", "Profile updated successfully.")}
            disabled={savingSection === "profile"}
            className="rounded-[8px] bg-[#f05a1a] px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#d95117] disabled:opacity-60"
          >
            {savingSection === "profile" ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="p-6 md:p-8 border-b border-[#e5e5e5]">
          <h2 className={`text-[18px] font-bold mb-6 ${titleClass}`}>Notifications</h2>
          <div className="space-y-5">
            {[
              { id: "email", label: "Email Reminders", desc: "Receive updates directly in your inbox." },
              { id: "sms", label: "SMS Alerts", desc: "Important alerts sent to your phone." },
              { id: "deadlines", label: "Deadline Notifications", desc: "Get reminded before election deadlines." },
              { id: "updates", label: "Registration Updates", desc: "Status updates on your Form 6 application." },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className={`text-[15px] font-medium ${titleClass}`}>{item.label}</p>
                  <p className={`text-[13px] ${mutedTextClass}`}>{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof NotificationPreferences] })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notifications[item.id as keyof NotificationPreferences] ? "bg-[#f05a1a]" : isDark ? "bg-[#434c5b]" : "bg-[#d8d2cb]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-transform ${
                      notifications[item.id as keyof NotificationPreferences] ? "translate-x-[22px]" : "translate-x-[2px]"
                    }`}
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => saveSettings({ notifications }, "notifications", "Notification preferences updated.")}
            disabled={savingSection === "notifications"}
            className="mt-6 rounded-[8px] bg-[#f05a1a] px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#d95117] disabled:opacity-60"
          >
            {savingSection === "notifications" ? "Saving..." : "Save Notifications"}
          </button>
        </div>

        <div className="p-6 md:p-8 border-b border-[#e5e5e5]">
          <h2 className={`text-[18px] font-bold mb-6 ${titleClass}`}>Account</h2>

          <div className="space-y-6">
            <div>
              <p className={`text-[15px] font-medium mb-1 ${titleClass}`}>Password</p>
              <p className={`text-[13px] mb-3 ${mutedTextClass}`}>Update your account password.</p>

              {!showPasswordForm ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className={`rounded-[8px] px-4 py-2 text-[14px] font-semibold transition-colors ${
                    isDark ? "bg-[#111418] border border-[#303743] text-white hover:bg-[#1b2026]" : "bg-white border border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#fafafa]"
                  }`}
                >
                  Change Password
                </button>
              ) : (
                <div className={`p-5 rounded-[8px] border space-y-4 ${isDark ? "border-[#303743] bg-[#111418]" : "border-[#e5e5e5] bg-[#fafafa]"}`}>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[13px] font-medium ${mutedTextClass}`}>Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className={fieldClass} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[13px] font-medium ${mutedTextClass}`}>New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={fieldClass} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[13px] font-medium ${mutedTextClass}`}>Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className={fieldClass} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePasswordUpdate}
                      disabled={savingSection === "password"}
                      className="rounded-[6px] bg-[#f05a1a] px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#d95117] disabled:opacity-60"
                    >
                      {savingSection === "password" ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      className={`rounded-[6px] px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                        isDark ? "bg-[#171a1d] border border-[#303743] text-white hover:bg-[#1b2026]" : "bg-white border border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#fafafa]"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#e5e5e5]">
              <p className={`text-[15px] font-medium mb-1 ${titleClass}`}>Delete Account</p>
              <p className={`text-[13px] mb-3 ${mutedTextClass}`}>Permanently delete your account and all associated data.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-[8px] bg-red-50 text-red-600 px-4 py-2 text-[14px] font-semibold transition-colors hover:bg-red-100"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h2 className={`text-[18px] font-bold mb-6 ${titleClass}`}>App Preferences</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={`text-[14px] font-medium ${mutedTextClass}`}>Theme</label>
              <div className={`flex rounded-[8px] p-1 ${isDark ? "bg-[#111418]" : "bg-[#f5f0eb]"}`}>
                {(["Light", "Dark"] as AppTheme[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, theme })}
                    className={`flex-1 rounded-[6px] py-1.5 text-[14px] font-medium transition-colors ${
                      preferences.theme === theme
                        ? "bg-white text-[#1a1a1a] shadow-sm"
                        : isDark
                          ? "text-[#a4acb6] hover:text-white"
                          : "text-[#666] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => saveSettings({ theme: preferences.theme }, "preferences", "App preferences updated.")}
            disabled={savingSection === "preferences"}
            className="mt-6 rounded-[8px] bg-[#f05a1a] px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#d95117] disabled:opacity-60"
          >
            {savingSection === "preferences" ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`rounded-[12px] max-w-md w-full p-6 animate-in zoom-in-95 duration-200 ${panelClass}`}>
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className={`text-[18px] font-bold ${titleClass}`}>Delete Account?</h3>
            </div>
            <p className={`text-[15px] mb-6 ${mutedTextClass}`}>
              Are you sure you want to delete your account? This action cannot be undone and you will lose all your saved documents and registration progress.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={`rounded-[8px] px-4 py-2 text-[14px] font-semibold transition-colors ${
                  isDark ? "border border-[#303743] text-white hover:bg-[#1b2026]" : "border border-[#e5e5e5] text-[#1a1a1a] hover:bg-[#fafafa]"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={savingSection === "delete"}
                className="rounded-[8px] bg-red-600 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {savingSection === "delete" ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
