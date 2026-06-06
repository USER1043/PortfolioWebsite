/**
 * @file Home page — Hero + SideCard grid, "What I Do" mini-cards, and footer note.
 * @module app/page
 */
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection/HeroSection";
import SideCard from "@/components/SideCard/SideCard";
import MiniCard from "@/components/MiniCard/MiniCard";
import FadeInScroll from "@/components/FadeInScroll/FadeInScroll";
import { miniCards } from "@/data/miniCards";

export const metadata: Metadata = {
  title: "Prajan Karthik — Portfolio",
  description: "3rd year CS student building full-stack web apps, mobile experiments, and more.",
};

// SSG home page — pre-rendered at build time.
export default function HomePage() {
  return (
    <>
      {/* Two-column hero grid */}
      <main className="grid grid-cols-[minmax(0,3.2fr)_minmax(0,2.6fr)] gap-[18px] items-stretch max-[800px]:grid-cols-1">
        <HeroSection />
        <SideCard />
      </main>

      {/* "What I Do" section */}
      <section className="mt-6" id="skills">
        <FadeInScroll>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base font-[650] tracking-[-0.02em]">What I do</h2>
            <p className="text-xs text-[#6b7e75]">Things i have actually worked on.</p>
          </div>
        </FadeInScroll>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          {miniCards.map((card, index) => (
            <FadeInScroll key={card.title} delay={index * 0.1}>
              <MiniCard {...card} />
            </FadeInScroll>
          ))}
        </div>
      </section>

      {/* Footer tagline */}
      <footer className="mt-6 text-[11px] text-[#6b7e75] flex items-center gap-1.5" id="contact">
        <div className="w-1.5 h-1.5 rounded-full bg-[#0faf64]" />
        <span>Built by me, with a mix of curiosity, caffeine, and a healthy respect for semicolons.</span>
      </footer>
    </>
  );
}
