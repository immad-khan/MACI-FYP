"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Send, Lock, Check } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/shared/Button";
import { PasswordStrength } from "@/components/shared/PasswordStrength";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

type PageState = "email" | "sent" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("email");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(57);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeUnmet, setShakeUnmet] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
  });

  const newPassword = watch("password") || "";

  useEffect(() => {
    if (state === "sent" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [state, countdown]);

  const onSubmitEmail = async (data: EmailFormData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setEmail(data.email);
    setIsLoading(false);
    setState("sent");
    setCountdown(57);
  };

  const onSubmitReset = async (data: ResetFormData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Reset password:", data);
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] p-4 sm:p-6">
      <AnimatedBackground particleCount={45} calm />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[20px] border border-[rgba(108,99,255,0.2)] bg-[rgba(20,20,40,0.8)] p-8 shadow-[0_0_60px_rgba(108,99,255,0.1)] backdrop-blur-[20px] sm:p-10"
      >
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent" />

        <AnimatePresence mode="wait">
          {state === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href="/login"
                className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#6c63ff] transition-colors hover:underline"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>

              <div className="mb-6 flex justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(108,99,255,0.1)]"
                >
                  <Mail size={32} className="text-[#6c63ff]" />
                </motion.div>
              </div>

              <h1 className="text-center text-[26px] font-bold tracking-tight text-[#f0f0ff]">
                Forgot your password?
              </h1>
              <p className="mt-2 text-center text-[14px] leading-relaxed text-[#8b8ba7]">
                No worries. Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="mt-8 space-y-5">
                <FormInput
                  label="Email Address"
                  icon={<Mail size={18} />}
                  type="email"
                  error={emailErrors.email?.message}
                  {...registerEmail("email")}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-6 text-center text-[13px] text-[#4a4a6a]">
                Remember it after all?{" "}
                <Link href="/login" className="text-[#6c63ff] hover:underline">
                  Log in
                </Link>
              </p>
            </motion.div>
          )}

          {state === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className="mb-6 flex justify-center">
                <motion.div
                  initial={{ x: -20, y: 20, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,212,255,0.1)]"
                >
                  <Send size={32} className="text-[#00d4ff]" />
                </motion.div>
              </div>

              <h1 className="text-[26px] font-bold tracking-tight text-[#f0f0ff]">
                Check your inbox
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#8b8ba7]">
                We sent a password reset link to{" "}
                <span className="font-medium text-[#f0f0ff]">{email}</span>. Check your spam folder
                if you don&apos;t see it.
              </p>

              <div className="mt-6">
                {countdown > 0 ? (
                  <p className="text-[14px] text-[#8b8ba7]">
                    Resend link in{" "}
                    <span className="font-mono font-bold text-[#f0f0ff]">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCountdown(57);
                    }}
                    className="text-[14px] font-medium text-[#6c63ff] hover:underline"
                  >
                    Resend link
                  </button>
                )}
              </div>

              <p className="mt-6 text-[13px] text-[#4a4a6a]">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => setState("email")}
                  className="text-[#6c63ff] hover:underline"
                >
                  Go back
                </button>
              </p>

              {/* Demo-only state transition */}
              <button
                type="button"
                onClick={() => setState("reset")}
                className="mt-8 text-[12px] text-[#4a4a6a] underline hover:text-[#8b8ba7]"
              >
                (Demo: proceed to reset form)
              </button>
            </motion.div>
          )}

          {state === "reset" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setState("sent")}
                className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-[#6c63ff] transition-colors hover:underline"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,255,136,0.1)]">
                  <Lock size={32} className="text-[#00ff88]" />
                </div>
              </div>

              <h1 className="text-center text-[26px] font-bold tracking-tight text-[#f0f0ff]">
                Reset password
              </h1>
              <p className="mt-2 text-center text-[14px] text-[#8b8ba7]">
                Create a new secure password for your account.
              </p>

              <form onSubmit={handleSubmitReset(onSubmitReset)} className="mt-8 space-y-5">
                <div>
                  <FormInput
                    label="New Password"
                    icon={<Lock size={18} />}
                    showPasswordToggle
                    error={resetErrors.password?.message}
                    {...registerReset("password")}
                  />
                  <PasswordStrength password={newPassword} shakeUnmet={shakeUnmet} />
                </div>

                <FormInput
                  label="Confirm Password"
                  icon={<Lock size={18} />}
                  showPasswordToggle
                  error={resetErrors.confirmPassword?.message}
                  {...registerReset("confirmPassword")}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                >
                  Reset Password
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
