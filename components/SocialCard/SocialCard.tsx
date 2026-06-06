/**
 * @file Social link card for the Contact page — opens external link in a new tab.
 * @module components/SocialCard
 */
import type { Social } from "@/data/socials";

// Renders a glassmorphic card that links to a social profile.
export default function SocialCard({ title, description, linkText, href }: Social) {
  return (
    <a
      className="no-underline text-[#1f2a26] backdrop-blur-[18px] saturate-[130%] bg-[rgba(255,255,255,0.72)] rounded-[24px] border border-[rgba(227,237,230,0.9)] shadow-[0_14px_40px_rgba(0,0,0,0.06)] p-[18px_18px_20px] flex flex-col gap-1.5 hover:-translate-y-[3px] transition-transform duration-200"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h3 className="text-[17px] font-[650]">{title}</h3>
      <p className="text-[13px] text-[#6b7e75]">{description}</p>
      <span className="mt-auto text-[13px] text-[#0a8a50] underline">{linkText}</span>
    </a>
  );
}
