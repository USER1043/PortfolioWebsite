/**
 * @file Single skill card displaying title, description, and tech chips.
 * @module components/SkillCard
 */
import type { Skill } from "@/data/skills";

interface SkillCardProps {
  skill: Skill;
  onOpenModal?: (id: string) => void;
}

// Renders a glassmorphic skill card; modal button omitted (kept for future use).
export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="backdrop-blur-[18px] saturate-[140%] bg-[rgba(255,255,255,0.72)] rounded-[24px] border border-[rgba(227,237,230,0.9)] shadow-[0_14px_40px_rgba(0,0,0,0.06)] p-[18px_18px_22px] flex flex-col gap-2.5">
      <h2 className="font-[650] text-[17px]">{skill.title}</h2>
      <p className="text-[13px] text-[#6b7e75]">{skill.description}</p>
      <div className="flex gap-1.5 flex-wrap">
        {skill.chips.map((chip) => (
          <span key={chip} className="px-2 py-1 text-[11px] rounded-full bg-[rgba(223,245,232,0.85)] text-[#0a8a50] font-medium">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
