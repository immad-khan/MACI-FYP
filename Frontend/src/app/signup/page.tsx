"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Mail, Lock, Check } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { MaciLogo } from "@/components/shared/MaciLogo";
import { FormInput } from "@/components/shared/FormInput";
import { PasswordStrength, criteria } from "@/components/shared/PasswordStrength";
import { Button } from "@/components/shared/Button";
import { SocialButtons } from "@/components/shared/SocialButtons";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
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

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeUnmet, setShakeUnmet] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const allCriteriaMet = criteria.every((c) => c.test(password));
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data: SignupFormData) => {
    if (!allCriteriaMet) {
      setShakeUnmet(true);
      setTimeout(() => setShakeUnmet(false), 300);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Signup data:", data);
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/chat");
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0f]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left decorative panel */}
        <div className="relative hidden min-h-[300px] flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] p-8 lg:flex lg:w-[40%] lg:min-h-screen">
          <AnimatedBackground particleCount={40} lighter calm />

          <div className="relative z-10 flex max-w-sm flex-col items-center text-center">
            <MaciLogo size="lg" />
            <p className="mt-8 text-[18px] leading-relaxed text-[#8b8ba7]">
              Join thousands of developers building better code with AI
            </p>

            <div className="mt-8 space-y-4 text-left">
              {[
                "Four specialized AI agents working in parallel",
                "Bug detection with systematic taxonomy",
                "Automated repair and code optimization",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00ff88]/15">
                    <Check size={12} className="text-[#00ff88]" />
                  </div>
                  <span className="text-[14px] text-[#f0f0ff]">{feature}</span>
                </div>
              ))}
            </div>

            {/* Agent pipeline visualization */}
            <div className="mt-12 flex items-center gap-2">
              {["Master", "Writer", "Verifier", "Optimizer"].map((agent, index) => (
                <div key={agent} className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(108,99,255,0.4)",
                        "0 0 20px rgba(108,99,255,0.8)",
                        "0 0 10px rgba(108,99,255,0.4)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                    className="h-3 w-3 rounded-full bg-[#6c63ff]"
                  />
                  {index < 3 && (
                    <div className="h-[2px] w-8 overflow-hidden rounded-full bg-[#1e1e3a]">
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: index * 0.3,
                          ease: "linear",
                        }}
                        className="h-full w-full bg-[#6c63ff]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-1 items-center justify-center bg-[#0f0f1a] p-4 sm:p-8"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <MaciLogo size="md" />
            </div>

            <div className="mb-8 hidden lg:block">
              <span className="font-mono text-[18px] font-bold text-[#6c63ff]">MACI</span>
            </div>

            <h1 className="text-[28px] font-bold tracking-tight text-[#f0f0ff]">
              Create your account
            </h1>
            <p className="mt-2 text-[14px] text-[#8b8ba7]">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#6c63ff] hover:underline">
                Log in
              </Link>
            </p>
            <p className="mt-1 text-[12px] text-[#4a4a6a]">
              Demo login: <span className="font-mono text-[#8b8ba7]">demo@maci.ai</span> /{" "}
              <span className="font-mono text-[#8b8ba7]">Demo123!</span>
            </p>

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <motion.div variants={itemVariants}>
                <FormInput
                  label="Full Name"
                  icon={<User size={18} />}
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormInput
                  label="Email Address"
                  icon={<Mail size={18} />}
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormInput
                  label="Password"
                  icon={<Lock size={18} />}
                  showPasswordToggle
                  error={errors.password?.message}
                  isValid={!!passwordsMatch && allCriteriaMet}
                  {...register("password")}
                />
                <PasswordStrength password={password} shakeUnmet={shakeUnmet} />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormInput
                  label="Confirm Password"
                  icon={<Lock size={18} />}
                  showPasswordToggle
                  error={errors.confirmPassword?.message}
                  isValid={!!passwordsMatch}
                  {...register("confirmPassword")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                >
                  Create Account
                </Button>
              </motion.div>
            </motion.form>

            <div className="mt-8">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[#1e1e3a]" />
                <span className="mx-4 text-[12px] text-[#4a4a6a]">or continue with</span>
                <div className="flex-grow border-t border-[#1e1e3a]" />
              </div>

              <div className="mt-6">
                <SocialButtons mode="signup" />
              </div>
            </div>

            <p className="mt-8 text-center text-[11px] leading-relaxed text-[#4a4a6a]">
              By creating an account you agree to our{" "}
              <Link href="#terms" className="text-[#6c63ff] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#privacy" className="text-[#6c63ff] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
