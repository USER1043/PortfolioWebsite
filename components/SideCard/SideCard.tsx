"use client";
/**
 * @file Right-side "Quick snapshot" card — slides in from right via Framer Motion.
 * @module components/SideCard
 */
import { motion } from "framer-motion";

const CHIPS = [
  "Full-stack dev",
  "React",
  "Node + MongoDB",
  "React Native",
  "Security curious",
];

// Animated aside card displaying a quick bio snapshot.
export default function SideCard() {
  return (
    <motion.aside
      className="bg-white rounded-[24px] p-[18px] border border-[rgba(200,230,210,0.9)] shadow-[0_8px_32px_rgba(0,0,0,0.10)] relative overflow-hidden text-[#1f2a26]"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-[-120px] bg-[radial-gradient(circle_at_top_right,rgba(15,138,95,0.08),transparent_65%)] pointer-events-none" />

      <div className="text-[11px] uppercase tracking-[0.18em] text-[#6b7e75] mb-2.5">Quick snapshot</div>
      <div className="text-[17px] font-semibold mb-2">
        Creative engineer energy<span className="text-[#0faf64]"> × Slight debugging addiction</span>
      </div>
      <p className="text-[13px] text-[#6b7e75] mb-3">
        I like building things that i actually want - from small tools for myself to club projects.
        Half builder, half curious breaker (only on my own Wi-Fi, don&apos;t worry 😄).
      </p>
      <div className="flex flex-wrap gap-2 mb-2.5 relative z-10">
        {CHIPS.map((chip) => (
          <div key={chip} className="text-[11px] px-[9px] py-1 rounded-full bg-[#e7f7ef] text-[#0faf64] border border-[rgba(15,138,95,0.12)]">
            {chip}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-[#6b7e75]">
        Looking for <strong className="text-[#1f2a26] font-semibold">summer 2026 internships</strong> where I
        can ship real features, learn a ton, and bring some playful energy to the team.
      </div>
    </motion.aside>
  );
}
