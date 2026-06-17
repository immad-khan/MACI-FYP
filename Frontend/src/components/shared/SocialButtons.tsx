"use client";

import { Github, Chrome } from "lucide-react";

interface SocialButtonsProps {
  mode?: "signup" | "login";
}

export function SocialButtons({ mode = "signup" }: SocialButtonsProps) {
  const action = mode === "signup" ? "Continue" : "Sign in";

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#1e1e3a] bg-[#141428] text-[13px] font-medium text-[#f0f0ff] transition-all duration-200 hover:border-[#6c63ff] hover:bg-[rgba(108,99,255,0.05)] hover:-translate-y-0.5"
      >
        <Chrome size={18} />
        <span>{action} with Google</span>
      </button>
    </div>
  );
}
