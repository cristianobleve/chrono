"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const smoothEase = [0.16, 1, 0.3, 1] as const;

export function HeroMotion({ children, className = "" }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className = "", delay = 0 }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: smoothEase, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({ children, className = "", delay = 0 }: MotionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}
      transition={{ duration: 0.6, ease: smoothEase, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AmbientColorGradients() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Top Center Indigo/Violet Radial Glow */}
      <div
        className="absolute left-1/2 -top-24 h-[520px] w-[900px] -translate-x-1/2 opacity-35 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.25) 45%, transparent 70%)",
        }}
      />

      {/* Secondary Cyan/Teal Ambient Drift on Right */}
      <div
        className="absolute -right-20 top-80 h-[420px] w-[500px] opacity-20 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(20, 184, 166, 0.35) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* Bottom Center Rose/Violet Glow for CTA section */}
      <div
        className="absolute left-1/2 bottom-32 h-[450px] w-[800px] -translate-x-1/2 opacity-25 blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 75%)",
        }}
      />
    </div>
  );
}
