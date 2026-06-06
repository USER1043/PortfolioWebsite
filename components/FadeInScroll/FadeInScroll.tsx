"use client";
/**
 * @file Scroll-triggered fade-in + slide-up wrapper using Framer Motion.
 * @module components/FadeInScroll
 */
import { motion, type Variants } from "framer-motion";

const fadeUpVariant: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: "easeOut" as const } },
};

interface FadeInScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// Wraps children with a fade-in + slide-up animation that triggers once on viewport entry.
export default function FadeInScroll({ children, delay = 0, className = "" }: FadeInScrollProps) {
  return (
    <motion.div
      className={className}
      variants={fadeUpVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
