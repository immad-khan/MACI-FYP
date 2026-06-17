"use client";

import { motion } from "framer-motion";

interface PasswordStrengthProps {
  password: string;
  shakeUnmet?: boolean;
}

const criteria = [
  { key: "length", label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
  { key: "uppercase", label: "One uppercase letter (A-Z)", test: (pwd: string) => /[A-Z]/.test(pwd) },
  { key: "lowercase", label: "One lowercase letter (a-z)", test: (pwd: string) => /[a-z]/.test(pwd) },
  { key: "special", label: "One special character (!@#$%...)", test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

const strengthLevels = [
  { min: 0, color: "#ff6b6b", width: "25%" },
  { min: 2, color: "#ff9f43", width: "50%" },
  { min: 3, color: "#ffc107", width: "75%" },
  { min: 4, color: "#00ff88", width: "100%" },
];

export function PasswordStrength({ password, shakeUnmet = false }: PasswordStrengthProps) {
  if (!password) return null;

  const metCount = criteria.filter((c) => c.test(password)).length;
  const currentLevel = strengthLevels.reduce((acc, level) =>
    metCount >= level.min ? level : acc
  );

  return (
    <div className="mt-3 space-y-3">
      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e1e3a]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: currentLevel.width }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: currentLevel.color }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {criteria.map((criterion) => {
          const isMet = criterion.test(password);
          const shouldShake = shakeUnmet && !isMet;

          return (
            <motion.li
              key={criterion.key}
              animate={shouldShake ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-2.5 text-[12px] transition-colors duration-200 ${isMet ? "text-[#f0f0ff]" : "text-[#4a4a6a]"}`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200 ${isMet ? "bg-[#00ff88] text-[#0a0a0f]" : "bg-[#ff6b6b]/10 text-[#ff6b6b]"}`}
              >
                {isMet ? "✓" : "✗"}
              </span>
              {criterion.label}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

export { criteria };
