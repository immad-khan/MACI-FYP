"use client";

import { ParticleNetwork } from "./ParticleNetwork";

interface AnimatedBackgroundProps {
  className?: string;
  particleCount?: number;
  lighter?: boolean;
  showGrid?: boolean;
  calm?: boolean;
}

export function AnimatedBackground({
  className = "",
  particleCount = 60,
  lighter = false,
  showGrid = true,
  calm = false,
}: AnimatedBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Gradient orbs */}
      <div
        className={`absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#6c63ff] opacity-20 blur-[120px] ${calm ? "orb-drift-slow" : "orb-drift"}`}
      />
      <div
        className={`absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-[#00d4ff] opacity-15 blur-[100px] ${calm ? "orb-drift" : "orb-drift-slow"}`}
      />
      <div
        className={`absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-[#4c3fe3] opacity-20 blur-[120px] ${calm ? "orb-drift-slow" : "orb-drift"}`}
      />

      {/* Dot grid overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Particle network */}
      <ParticleNetwork particleCount={particleCount} lighter={lighter} />
    </div>
  );
}
