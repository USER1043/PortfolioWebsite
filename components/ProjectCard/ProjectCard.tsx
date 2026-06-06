"use client";
/**
 * @file Single project card with demo/code links and a modal trigger button.
 * @module components/ProjectCard
 */
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  onOpenModal: (id: string) => void;
}

// Renders a glassmorphic project card with conditional action buttons.
export default function ProjectCard({ project, onOpenModal }: ProjectCardProps) {
  return (
    <article className="relative p-[18px_18px_20px] rounded-[26px] border border-[rgba(227,237,230,0.9)] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.06)] backdrop-blur-[18px] flex flex-col gap-3 justify-between">
      {project.badge && (
        <div className="absolute top-2.5 right-3 px-2.5 py-1 bg-[#cbf7dd] text-[#0a8a50] text-[11px] rounded-full font-semibold">
          {project.badge}
        </div>
      )}

      <h2 className="font-[650] text-[17px]">{project.title}</h2>
      <p className="text-[13px] text-[#6b7e75]">{project.description}</p>

      <div className="flex gap-1.5 flex-wrap">
        {project.stack.map((tech) => (
          <span key={tech} className="text-[11px] px-2 py-1 rounded-full bg-[rgba(223,245,232,0.85)] text-[#0a8a50] font-medium">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-1.5">
        {project.demoUrl && (
          <a href={project.demoUrl} className="px-3.5 py-2 text-[13px] rounded-full no-underline bg-gradient-to-r from-[#0faf64] to-[#0a8a50] text-white font-medium shadow-[0_6px_20px_rgba(12,112,80,0.35)] hover:brightness-[1.13] hover:-translate-y-px transition-all duration-200 inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
            Demo
          </a>
        )}
        {project.codeUrl && (
          <a href={project.codeUrl} className="px-3.5 py-2 text-[13px] rounded-full no-underline bg-slate-400/[0.16] text-[#0a8a50] font-medium hover:bg-slate-400/[0.24] transition-all duration-200 inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
            View Code
          </a>
        )}
        {project.deadLabel && (
          <span className="px-3.5 py-2 text-[13px] rounded-full bg-slate-400/[0.16] text-[#0a8a50] font-medium">
            {project.deadLabel}
          </span>
        )}
        <button
          className="px-0 py-2 text-[13px] bg-transparent border-none cursor-pointer text-[#0a8a50] underline hover:no-underline transition-all duration-200"
          onClick={() => onOpenModal(project.id)}
        >
          More details
        </button>
      </div>
    </article>
  );
}
