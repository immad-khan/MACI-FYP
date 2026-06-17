"use client";

import { motion } from "framer-motion";

interface MaciLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { width: 80, height: 32 },
  md: { width: 120, height: 48 },
  lg: { width: 220, height: 88 },
  xl: { width: 320, height: 128 },
};

export function MaciLogo({ size = "md", animate = true, className = "" }: MaciLogoProps) {
  const { width, height } = sizes[size];
  const fontSize = height * 0.85;

  const letterVariants = {
    hidden: (custom: { x: number; y: number; rotate: number }) => ({
      x: custom.x,
      y: custom.y,
      rotate: custom.rotate,
      opacity: 0,
    }),
    visible: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.34, 1.56, 0.64, 1] as const,
      },
    },
  };

  const letterCustom = {
    M: { x: -120, y: -80, rotate: -15 },
    A: { x: 120, y: -80, rotate: 15 },
    C: { x: -120, y: 80, rotate: 15 },
    I: { x: 120, y: 80, rotate: -15 },
  };

  const letters = ["M", "A", "C", "I"] as const;

  return (
    <div className={`inline-flex ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? "logo-breathe" : ""}
      >
        <text
          x="50%"
          y="55%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="var(--font-serif)"
          fontSize={fontSize}
          fontWeight="700"
          letterSpacing="-0.04em"
          fill="#6c63ff"
        >
          {animate ? (
            letters.map((letter, i) => (
              <motion.tspan
                key={letter}
                custom={letterCustom[letter]}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.1 }}
                dx={i === 0 ? undefined : -fontSize * 0.05}
              >
                {letter}
              </motion.tspan>
            ))
          ) : (
            <tspan>MACI</tspan>
          )}
        </text>
      </svg>
    </div>
  );
}
