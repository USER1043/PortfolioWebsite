"use client";
/**
 * @file Work page — project cards grid with modal details; "use client" for useState.
 * @module app/work/page
 */
import { useState } from "react";
import PageHeader from "@/components/PageHeader/PageHeader";
import PageFooter from "@/components/PageFooter/PageFooter";
import ProjectCard from "@/components/ProjectCard/ProjectCard";
import Modal from "@/components/Modal/Modal";
import FadeInScroll from "@/components/FadeInScroll/FadeInScroll";
import { projects } from "@/data/projects";

// Work page — lists all projects and opens detail modals on demand.
export default function WorkPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const activeProject = projects.find((p) => p.id === activeModal);

  return (
    <>
      <FadeInScroll>
        <PageHeader
          title="Projects I've built or contributed to 💪"
          subtitle="A selection of things I enjoyed designing, debugging, and deploying."
        />
      </FadeInScroll>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {projects.map((project, index) => (
          <FadeInScroll key={project.id} delay={index * 0.1}>
            <ProjectCard project={project} onOpenModal={setActiveModal} />
          </FadeInScroll>
        ))}
      </section>

      <PageFooter
        text="Want to collaborate 🤝? →"
        linkText="Send an email"
        href="mailto:prjnkrthk@gmail.com"
      />

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
