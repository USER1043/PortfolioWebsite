// src/pages/SkillsPage/SkillsPage.jsx
// Skills page — displays skill cards with optional modals
import { useState } from "react";
import styles from "./SkillsPage.module.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import SkillCard from "../../components/SkillCard/SkillCard";
import Modal from "../../components/Modal/Modal";
import FadeInScroll from "../../components/FadeInScroll/FadeInScroll";
import { skills } from "../../data/skills";

function SkillsPage() {
    // Track which modal is currently open (null = none)
    const [activeModal, setActiveModal] = useState(null);

    // Find the active skill's modal data
    const activeSkill = skills.find((s) => s.id === activeModal);

    return (
        <>
            <FadeInScroll>
                <PageHeader
                    title="Skills I've become friends with 👇"
                    subtitle="From full-stack engineering to club experience & security curiosity."
                />
            </FadeInScroll>

            {/* Skill cards grid */}
            <section className={styles.skillSection}>
                {skills.map((skill, index) => (
                    <FadeInScroll key={skill.id} delay={index * 0.08}>
                        <SkillCard
                            skill={skill}
                            onOpenModal={setActiveModal}
                        />
                    </FadeInScroll>
                ))}
            </section>

            <PageFooter
                text="If you want to pair on something cool →"
                linkText="Mail me ✨"
                href="mailto:prjnkrthk@gmail.com"
            />

            {/* Render the modal if a skill is selected */}
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

export default SkillsPage;
