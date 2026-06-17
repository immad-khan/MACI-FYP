"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { MaciLogo } from "@/components/shared/MaciLogo";
import { TypewriterText } from "@/components/shared/TypewriterText";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const stats = [
  { value: 1163, suffix: "+", label: "Problems Tested" },
  { value: 3, suffix: " Primary", label: "Bug Categories" },
  { value: 10, suffix: " Secondary", label: "Bug Sub-types" },
  { value: 4, suffix: " Specialized", label: "AI Agents" },
];

const floatingSnippets = [
  "def optimize(arr): ...",
  "class AgentPipeline:",
  "return sorted(set(nums))",
  "verify(output, expected)",
  "for agent in agents:",
];

export default function LandingPage() {
  const [taglineComplete, setTaglineComplete] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 sm:px-6 lg:px-8">
        <AnimatedBackground particleCount={60} showGrid />

        <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
          <MaciLogo size="xl" animate />

          <div className="mt-8 h-[2px] w-48 overflow-hidden rounded-full bg-[#1e1e3a]">
            <div className="h-full w-full bg-[#6c63ff] line-draw" />
          </div>

          <h2 className="mt-6 text-[18px] font-medium tracking-wide text-[#8b8ba7] sm:text-[22px]">
            <TypewriterText
              text="Multi-Agent Collaborative Infrastructure"
              speed={50}
              delay={1400}
              onComplete={() => setTaglineComplete(true)}
            />
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={taglineComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-4 text-[16px] text-[#4a4a6a] sm:text-[18px]"
          >
            Four specialized AI agents. One perfect codebase.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={taglineComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="/chat"
              className="glossy-button relative flex h-[52px] items-center justify-center overflow-hidden rounded-[50px] bg-[#6c63ff] px-10 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#7b73ff] shimmer-button"
            >
              Start Building
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={taglineComplete ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-[13px] text-[#4a4a6a]"
          >
            No credit card required · Free tier available
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="h-10 w-6 rounded-full border-2 border-[#1e1e3a] p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-2 w-full rounded-full bg-[#6c63ff]"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-[#1e1e3a] bg-gradient-to-r from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-[36px] font-bold text-[#6c63ff] sm:text-[48px]">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-1 text-[14px] text-[#8b8ba7]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.12)_0%,transparent_60%)]" />

        {/* Floating code snippets */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {floatingSnippets.map((snippet, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.08 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.2 }}
              className="absolute font-mono text-[14px] text-[#f0f0ff]"
              style={{
                left: `${10 + index * 18}%`,
                top: `${20 + (index % 2) * 50}%`,
                transform: `rotate(${(index - 2) * 6}deg)`,
              }}
            >
              {snippet}
            </motion.div>
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[32px] font-bold tracking-tight text-[#f0f0ff] sm:text-[44px]">
              Ready to write better code?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#8b8ba7]">
              Join developers who trust MACI to generate, verify, and optimize their code.
            </p>
            <Link
              href="/chat"
              className="glossy-button relative mt-8 inline-flex h-[52px] items-center justify-center overflow-hidden rounded-[50px] bg-[#6c63ff] px-10 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#7b73ff] shimmer-button"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
