"use client";

import Link from "next/link";
import { MaciLogo } from "./MaciLogo";

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e3a] bg-[#0a0a0f] py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <MaciLogo size="sm" animate={false} />
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="#docs"
            className="text-[14px] text-[#8b8ba7] transition-colors hover:text-[#f0f0ff]"
          >
            Documentation
          </Link>
          <Link
            href="https://github.com"
            className="text-[14px] text-[#8b8ba7] transition-colors hover:text-[#f0f0ff]"
          >
            GitHub
          </Link>
          <Link
            href="#contact"
            className="text-[14px] text-[#8b8ba7] transition-colors hover:text-[#f0f0ff]"
          >
            Contact
          </Link>
        </div>

        <p className="text-[13px] text-[#4a4a6a]">
          © {new Date().getFullYear()} MACI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
