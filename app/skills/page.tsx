"use client";
/**
 * @file Skills page — skill cards grid with modal details; "use client" for useState.
 * @module app/skills/page
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader/PageHeader";
import PageFooter from "@/components/PageFooter/PageFooter";
import SkillCard from "@/components/SkillCard/SkillCard";
import Modal from "@/components/Modal/Modal";
import FadeInScroll from "@/components/FadeInScroll/FadeInScroll";
import { skills } from "@/data/skills";

// Skills page — lists all skill cards and opens detail modals on demand.
export default function SkillsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const activeSkill = skills.find((s) => s.id === activeModal);

  return (
    <>
      <FadeInScroll>
        <PageHeader
          title="Skills I've become friends with 👇"
          subtitle="From full-stack engineering to club experience & security curiosity."
        />
      </FadeInScroll>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {skills.map((skill, index) => (
          <FadeInScroll key={skill.id} delay={index * 0.08}>
            <SkillCard skill={skill} onOpenModal={setActiveModal} />
          </FadeInScroll>
        ))}
      </section>

      <PageFooter
        text="If you want to pair on something cool →"
        linkText="Mail me ✨"
        href="mailto:prjnkrthk@gmail.com"
      />

      {activeSkill && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={activeSkill.modal.title}
          subtitle={activeSkill.modal.subtitle}
          points={activeSkill.modal.points}
          tech={activeSkill.modal.tech}
        />
      )}
    </>
  );
}
