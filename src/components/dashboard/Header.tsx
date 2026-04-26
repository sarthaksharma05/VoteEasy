"use client";

import React, { useEffect, useState } from "react";


export function Header() {
  const [initials, setInitials] = useState("SS");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("unauthorized");
      })
      .then((data) => {
        if (data?.user?.name) {
          const names = data.user.name.split(" ");
          const letters = names.length > 1 
            ? names[0][0] + names[names.length - 1][0] 
            : names[0].slice(0, 2);
          setInitials(letters.toUpperCase());
        }
        setProfilePhoto(data?.user?.profilePhoto ?? "");
      })
      .catch(() => {
        setInitials("SS");
        setProfilePhoto("");
      });
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-[var(--color-border)] bg-surface-white px-6">
      <h1 className="text-lg font-semibold font-display text-surface-dark"></h1>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-3">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover border border-[var(--color-border)]"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-semibold text-white">{initials}</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
