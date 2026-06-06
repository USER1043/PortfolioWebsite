/**
 * @file Small "What I Do" card with icon, title, body, and tag pills.
 * @module components/MiniCard
 */
import type { MiniCardData } from "@/data/miniCards";

// Renders a compact info card from MiniCardData.
export default function MiniCard({ icon, title, body, tags }: MiniCardData) {
  return (
    <article className="bg-[rgba(255,255,255,0.96)] rounded-[18px] p-[12px_13px] border border-[rgba(227,237,230,0.9)] shadow-[0_8px_22px_rgba(15,23,42,0.05)] flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="w-[26px] h-[26px] rounded-[12px] flex items-center justify-center text-[15px] bg-[#e7f7ef]">
          {icon}
        </div>
        <div className="text-[13px] font-semibold">{title}</div>
      </div>
      <p className="text-[12px] text-[#6b7e75]">{body}</p>
      <div className="flex flex-wrap gap-1 mt-0.5">
        {tags.map((tag) => (
          <span key={tag} className="text-[11px] px-[7px] py-[3px] rounded-full bg-[#eefdf5] text-[#0f8a5f]">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
