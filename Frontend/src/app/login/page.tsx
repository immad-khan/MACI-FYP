"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, Shield } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { MaciLogo } from "@/components/shared/MaciLogo";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/shared/Button";
import { SocialButtons } from "@/components/shared/SocialButtons";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(false);
    setIsLoading(true);

    // Simulate API call - demo credentials check
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (data.email === "demo@maci.ai" && data.password === "Demo123!") {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/chat");
      }, 1200);
    } else {
      setIsLoading(false);
      setLoginError(true);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f] p-4 sm:p-6">
      <AnimatedBackground particleCount={50} calm />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-[440px] overflow-hidden rounded-[20px] border border-[rgba(108,99,255,0.2)] bg-[rgba(20,20,40,0.8)] p-8 shadow-[0_0_60px_rgba(108,99,255,0.1)] backdrop-blur-[20px] sm:p-12 ${loginError ? "animate-shake" : ""}`}
      >
        {/* Shine highlight at top */}
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent" />

        <div className="mb-8 flex flex-col items-center">
          <MaciLogo size="md" animate={false} />
          <h1 className="mt-6 text-[28px] font-bold tracking-tight text-[#f0f0ff]">
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] text-[#8b8ba7]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#6c63ff] hover:underline">
              Sign up free
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Email Address"
            icon={<Mail size={18} />}
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <FormInput
              label="Password"
              icon={<Lock size={18} />}
              showPasswordToggle
              error={errors.password?.message || (loginError ? "Invalid email or password" : undefined)}
              {...register("password")}
            />
            <div className="mt-2 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#6c63ff] transition-colors hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            isSuccess={isSuccess}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#1e1e3a]" />
            <span className="mx-4 text-[12px] text-[#4a4a6a]">or continue with</span>
            <div className="flex-grow border-t border-[#1e1e3a]" />
          </div>

          <div className="mt-6">
            <SocialButtons mode="login" />
          </div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#4a4a6a]">
          <Shield size={12} />
          Secure login powered by MACI Infrastructure
        </p>
      </motion.div>
    </main>
  );
}
