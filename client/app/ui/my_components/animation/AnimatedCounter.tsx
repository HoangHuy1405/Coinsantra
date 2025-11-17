"use client";

import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);

  // Convert number → formatted display string
  const display = useTransform(
    motionValue,
    (v) => `${prefix}${Math.floor(v).toLocaleString()}${suffix}`,
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });

    return controls.stop;
  }, [value, duration, motionValue]);

  return <motion.span>{display}</motion.span>;
}
