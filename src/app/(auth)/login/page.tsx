"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const nextErrors: LoginErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setFormError("");

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as { message?: string; token?: string };

      if (!response.ok || !data.token) {
        throw new Error(data.message ?? "Unable to sign in.");
      }

      window.localStorage.setItem("voteeasy_token", data.token);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginForm, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  return (
    <AuthShell>
      <Card className="w-full max-w-[400px] p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <CheckCheck className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <p className="text-xl font-semibold tracking-[-0.02em]">
            <span className="text-foreground">Vote</span>
            <span className="text-primary">Easy</span>
          </p>
        </div>
        <div className="mb-8 space-y-2">
          <div className="space-y-2">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">
              Sign in to your account
            </h1>
            <p className="text-sm leading-6 text-muted">
              Access your dashboard and continue managing your voting workflows.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            error={errors.email}
            icon={Mail}
            id="email"
            label="Email"
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="name@company.com"
            type="email"
            value={formData.email}
          />

          <Input
            autoComplete="current-password"
            error={errors.password}
            icon={LockKeyhole}
            id="password"
            label="Password"
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Enter your password"
            rightElement={
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted transition-colors duration-200 ease-smooth hover:text-foreground"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            type={showPassword ? "text" : "password"}
            value={formData.password}
          />

          <div className="flex items-center justify-between gap-4">
            <Checkbox
              checked={formData.remember}
              id="remember"
              label="Remember me"
              onCheckedChange={(checked) => handleChange("remember", checked)}
            />
            <Link
              className="text-sm font-medium text-muted transition-colors duration-200 ease-smooth hover:text-primary"
              href="/login"
            >
              Forgot password?
            </Link>
          </div>

          <Button className="mt-2" loading={isLoading} type="submit">
            Sign in
          </Button>

          {formError ? <p className="text-sm text-primary">{formError}</p> : null}
        </form>

        <div className="my-6">
          <Divider />
        </div>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-foreground transition-colors duration-200 ease-smooth hover:text-primary"
            href="/register"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
