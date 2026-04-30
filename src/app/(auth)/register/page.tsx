"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";

interface RegisterForm {
  confirmPassword: string;
  email: string;
  fullName: string;
  password: string;
}

interface RegisterErrors {
  confirmPassword?: string;
  email?: string;
  fullName?: string;
  password?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterForm>({
    confirmPassword: "",
    email: "",
    fullName: "",
    password: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const nextErrors: RegisterErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName,
          password: formData.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create your account.");
      }

      setSuccessMessage("Account created successfully. Redirecting to login...");
      setFormData({
        confirmPassword: "",
        email: "",
        fullName: "",
        password: "",
      });

      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to create your account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterForm, value: string) => {
    const nextFormData = { ...formData, [field]: value };

    setFormData(nextFormData);
    setFormError("");
    setSuccessMessage("");
    setErrors((current) => {
      const nextErrors = { ...current, [field]: undefined };

      if (field === "password" || field === "confirmPassword") {
        if (!nextFormData.confirmPassword) {
          nextErrors.confirmPassword = undefined;
        } else if (nextFormData.password !== nextFormData.confirmPassword) {
          nextErrors.confirmPassword = "Passwords do not match.";
        } else {
          nextErrors.confirmPassword = undefined;
        }
      }

      return nextErrors;
    });
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
              Create your account
            </h1>
            <p className="text-sm leading-6 text-muted">
              Set up your workspace and start organizing secure, streamlined voting.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="name"
            error={errors.fullName}
            icon={UserRound}
            id="fullName"
            label="Full Name"
            onChange={(event) => handleChange("fullName", event.target.value)}
            placeholder="Enter your full name"
            type="text"
            value={formData.fullName}
          />

          <Input
            autoComplete="email"
            error={errors.email}
            icon={Mail}
            id="register-email"
            label="Email"
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="name@company.com"
            type="email"
            value={formData.email}
          />

          <Input
            autoComplete="new-password"
            error={errors.password}
            icon={LockKeyhole}
            id="register-password"
            label="Password"
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Create a password"
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

          <Input
            autoComplete="new-password"
            error={errors.confirmPassword}
            icon={LockKeyhole}
            id="confirmPassword"
            label="Confirm Password"
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
            placeholder="Confirm your password"
            rightElement={
              <button
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="text-muted transition-colors duration-200 ease-smooth hover:text-foreground"
                onClick={() => setShowConfirmPassword((current) => !current)}
                type="button"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
          />

          <Button className="mt-2" loading={isLoading} type="submit">
            Create your account
          </Button>

          {formError ? <p className="text-sm text-primary">{formError}</p> : null}
          {successMessage ? <p className="text-sm text-[#1F7A46]">{successMessage}</p> : null}
        </form>

        <div className="my-6">
          <Divider />
        </div>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            className="font-semibold text-foreground transition-colors duration-200 ease-smooth hover:text-primary"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
