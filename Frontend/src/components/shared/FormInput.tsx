"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
  isValid?: boolean;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      icon,
      error,
      isValid,
      showPasswordToggle = false,
      type = "text",
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

  const {
    onChange: propsOnChange,
    onBlur: propsOnBlur,
    onFocus: propsOnFocus,
    ...inputProps
  } = props;

  const borderColor = error
      ? "border-[#ff6b6b] focus:border-[#ff6b6b]"
      : isValid
        ? "border-[#00ff88] focus:border-[#00ff88]"
        : "border-[#1e1e3a] focus:border-[#6c63ff]";

    const glowColor = error
      ? "shadow-[0_0_0_2px_rgba(255,107,107,0.15)]"
      : isValid
        ? "shadow-[0_0_0_2px_rgba(0,255,136,0.15)]"
        : "focus:shadow-[0_0_0_2px_rgba(108,99,255,0.15)]";

    return (
      <div className={`relative ${className}`}>
        <motion.label
          initial={false}
          animate={{
            y: isFocused || hasValue ? -28 : 14,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: isFocused ? "#6c63ff" : error ? "#ff6b6b" : "#4a4a6a",
          }}
          className="pointer-events-none absolute left-12 top-0 origin-left text-[11px] font-medium uppercase tracking-[0.08em]"
        >
          {label}
        </motion.label>

        <div className="relative">
          <div
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? "text-[#6c63ff]" : error ? "text-[#ff6b6b]" : "text-[#4a4a6a]"}`}
          >
            {icon}
          </div>

          <input
            ref={ref}
            type={inputType}
            className={`h-12 w-full rounded-[10px] border bg-[#141428] pl-12 pr-4 text-[15px] text-[#f0f0ff] outline-none transition-all duration-200 placeholder:text-transparent ${borderColor} ${glowColor}`}
            aria-label={label}
            aria-invalid={!!error}
            {...inputProps}
            onFocus={(e) => {
              setIsFocused(true);
              propsOnFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              propsOnBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              propsOnChange?.(e);
            }}
          />

          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a4a6a] transition-colors hover:text-[#8b8ba7]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 flex items-center gap-1.5 text-[12px] text-[#ff6b6b]"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff6b6b]/10 text-[10px]">
                ✕
              </span>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
