"use client";
/** @file Hero card on the Home page with staggered entrance animations. */
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: "easeOut" as const } },
};

// Left-side hero section with animated heading, subtitle, and CTA buttons.
export default function HeroSection() {
  return (
    <motion.section
      className="bg-white rounded-[24px] p-[22px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[rgba(200,230,210,0.9)] relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Subtle radial glow — bounded to card viewport to prevent ghost green box */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,138,95,0.12),transparent_60%)] pointer-events-none rounded-[24px]" />

      <motion.div
        className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#cbf7dd] rounded-full text-[#0faf64] text-[11px] font-semibold tracking-[0.04em] uppercase mb-2.5 relative z-10"
        variants={itemVariants}
      >
        <span className="w-2 h-2 rounded-full bg-[#16a34a] [animation:dotPulse_2s_ease-in-out_infinite]" />
        <span>Hey there, 👋</span>
      </motion.div>

      <motion.h1
        className="text-[clamp(28px,3.2vw,34px)] leading-[1.12] font-[750] tracking-[-0.03em] mb-2 relative z-10"
        variants={itemVariants}
      >
        I build{" "}
        <span className="bg-gradient-to-br from-[#0faf64] to-[#0a8a50] bg-clip-text text-transparent">
          full-stack
        </span>{" "}
        web apps &amp; engineer things that actually ship.
      </motion.h1>

      <motion.p className="text-sm text-[#6b7e75] max-w-[480px] mb-4 relative z-10" variants={itemVariants}>
        3<sup>rd</sup> year CS student with hands-on experience in web development, embedded
        systems, and systems-level problem solving. I enjoy turning messy ideas into clean UI,
        scalable backend logic, and structured apps.
      </motion.p>

      <motion.div className="flex flex-wrap gap-2.5 mb-4 relative z-10" variants={itemVariants}>
        <Link
          href="/work"
          className="rounded-full px-4 py-2 text-[13px] font-medium text-white bg-gradient-to-br from-[#0faf64] to-[#0a8a50] shadow-[0_10px_30px_rgba(12,112,80,0.45)] hover:brightness-[1.13] hover:-translate-y-px transition-all duration-[160ms] no-underline"
        >
          View my projects 🚀
        </Link>
        <Link
          href="/contact"
          className="rounded-full px-4 py-2 text-[13px] font-medium text-[#3b4a42] bg-slate-400/[0.14] hover:bg-slate-400/[0.22] hover:-translate-y-px transition-all duration-[160ms] no-underline"
        >
          Say Hi 👋
        </Link>
      </motion.div>

      <motion.div className="flex flex-wrap gap-3 text-xs text-[#6b7e75] relative z-10" variants={itemVariants}>
        <div className="px-2.5 py-1.5 rounded-full bg-slate-400/[0.18] inline-flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#166a4a]">Focus</span>
          Full-stack Dev, MERN, Security, DevOps
        </div>
        <div className="px-2.5 py-1.5 rounded-full bg-slate-400/[0.18] inline-flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#166a4a]">Currently</span>
          Exploring full-stack roles and summer internships.
        </div>
      </motion.div>
    </motion.section>
  );
}
