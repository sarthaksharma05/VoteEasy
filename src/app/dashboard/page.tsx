"use client";

import { CalendarClock, FileText, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/Card";

interface DashboardUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
}

interface DashboardStat {
  label: string;
  value: string;
}

const statIcons = [ShieldCheck, FileText, CalendarClock] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? window.localStorage.getItem("voteeasy_token") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await response.json()) as {
          message?: string;
          stats?: DashboardStat[];
          user?: DashboardUser;
        };

        if (!response.ok || !data.user) {
          throw new Error(data.message ?? "Unable to load your dashboard.");
        }

        setUser(data.user);
        setStats(data.stats ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load your dashboard.",
        );
        window.localStorage.removeItem("voteeasy_token");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [router]);

  const joinedDate = useMemo(() => {
    if (!user) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(new Date(user.createdAt));
  }, [user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <p className="text-sm text-muted">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            VoteEasy Dashboard
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
              Welcome, {user?.name}
            </h1>
            <p className="text-sm leading-6 text-muted">
              Manage your voter registration journey, document readiness, and deadline reminders.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = statIcons[index] ?? ShieldCheck;

            return (
              <Card key={stat.label} className="rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">{stat.label}</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-input">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  {stat.value}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-2xl p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted">Account Name</p>
              <p className="text-lg font-semibold text-foreground">{user?.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted">Email Address</p>
              <p className="text-lg font-semibold text-foreground">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted">Member Since</p>
              <p className="text-lg font-semibold text-foreground">{joinedDate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted">Session State</p>
              <p className="text-lg font-semibold text-foreground">Authenticated</p>
            </div>
          </div>
          {error ? <p className="mt-6 text-sm text-primary">{error}</p> : null}
        </Card>
      </div>
    </main>
  );
}
