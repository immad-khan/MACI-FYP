"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { MaciLogo } from "./MaciLogo";

const navLinks: { href: string; label: string }[] = [];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[100] h-16 border-b border-[#1e1e3a] glass">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <MaciLogo size="sm" animate={false} />
          </Link>

          {navLinks.length > 0 && (
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[14px] text-[#8b8ba7] transition-colors hover:text-[#f0f0ff]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-[10px] px-4 py-2 text-[14px] font-medium text-[#8b8ba7] transition-colors hover:text-[#f0f0ff]"
            >
              Log In
            </Link>
            <Link
              href="/chat"
              className="glossy-button relative flex h-[36px] items-center justify-center rounded-[50px] bg-[#6c63ff] px-5 text-[13px] font-semibold text-white transition-all hover:bg-[#7b73ff] hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#f0f0ff] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-[280px] border-l border-[#1e1e3a] bg-[#0f0f1a] p-6 md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <MaciLogo size="sm" animate={false} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#8b8ba7]"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {navLinks.length > 0 && (
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-[10px] px-4 py-3 text-[16px] text-[#8b8ba7] transition-colors hover:bg-[#141428] hover:text-[#f0f0ff]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <div className={`flex flex-col gap-3 border-t border-[#1e1e3a] pt-6 ${navLinks.length > 0 ? "mt-8" : ""}`}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[10px] border border-[#1e1e3a] px-4 py-3 text-center text-[14px] font-medium text-[#f0f0ff] transition-colors hover:border-[#6c63ff]"
                >
                  Log In
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setMobileOpen(false)}
                  className="glossy-button relative flex h-[44px] items-center justify-center rounded-[50px] bg-[#6c63ff] px-4 text-center text-[14px] font-semibold text-white transition-colors hover:bg-[#7b73ff]"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
