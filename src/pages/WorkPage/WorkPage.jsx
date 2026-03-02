// src/pages/WorkPage/WorkPage.jsx
// Work page — displays project cards with modal details
import { useState } from "react";
import styles from "./WorkPage.module.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import Modal from "../../components/Modal/Modal";
import FadeInScroll from "../../components/FadeInScroll/FadeInScroll";
import { projects } from "../../data/projects";

function WorkPage() {
    // Track which modal is currently open (null = none)
    const [activeModal, setActiveModal] = useState(null);

    // Find the active project's modal data
    const activeProject = projects.find((p) => p.id === activeModal);

    return (
        <>
            <FadeInScroll>
                <PageHeader
                    title="Projects I've built or contributed to 💪"
                    subtitle="A selection of things I enjoyed designing, debugging, and deploying."
                />
            </FadeInScroll>

            {/* Project cards grid */}
            <section className={styles.grid}>
                {projects.map((project, index) => (
                    <FadeInScroll key={project.id} delay={index * 0.1}>
                        <ProjectCard
                            project={project}
                            onOpenModal={setActiveModal}
                        />
                    </FadeInScroll>
                ))}
            </section>

            <PageFooter
                text="Want to collaborate 🤝? →"
                linkText="Send an email"
                href="mailto:prjnkrthk@gmail.com"
            />

            {/* Render the modal if a project is selected */}
            {activeProject && (
                <Modal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    title={activeProject.modal.title}
                    subtitle={activeProject.modal.subtitle}
                    points={activeProject.modal.points}
                    tech={activeProject.modal.tech}
                />
            )}
        </>
    );
}

export default WorkPage;
