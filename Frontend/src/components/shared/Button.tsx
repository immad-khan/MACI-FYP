"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  isLoading?: boolean;
  isSuccess?: boolean;
  shimmer?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  isLoading = false,
  isSuccess = false,
  shimmer = false,
  children,
  className = "",
  disabled,
  onClick,
  type,
  form,
  name,
  value,
  title,
  tabIndex,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center rounded-[10px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c63ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]";

  const variants = {
    primary:
      "glossy-button bg-[#6c63ff] text-white hover:bg-[#7b73ff] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0",
    secondary:
      "border border-[rgba(108,99,255,0.4)] bg-transparent text-[#f0f0ff] hover:border-[#6c63ff] hover:bg-[rgba(108,99,255,0.08)] hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(108,99,255,0.15)]",
    ghost:
      "bg-transparent text-[#8b8ba7] hover:text-[#f0f0ff] hover:bg-[rgba(255,255,255,0.05)]",
    outline:
      "border border-[#1e1e3a] bg-[#141428] text-[#f0f0ff] hover:border-[#6c63ff] hover:bg-[rgba(108,99,255,0.05)]",
  };

  return (
    <motion.button
      type={type}
      form={form}
      name={name}
      value={value}
      title={title}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${shimmer ? "shimmer-button" : ""} ${className}`}
      disabled={disabled || isLoading || isSuccess}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white border-t-transparent" />
      ) : isSuccess ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00ff88]">
            <Check className="h-4 w-4 text-[#0a0a0f]" strokeWidth={3} />
          </div>
          <span>Success</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
}
