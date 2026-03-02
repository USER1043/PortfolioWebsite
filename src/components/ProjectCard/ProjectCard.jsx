// src/components/ProjectCard/ProjectCard.jsx
// Single project card for the Work page — renders from project data

function ProjectCard({ project, onOpenModal }) {
    return (
        <article className="project-card">
            {/* Optional "Featured" badge */}
            {project.badge && <div className="badge">{project.badge}</div>}

            <h2 className="project-title">{project.title}</h2>
            <p className="project-desc">{project.description}</p>

            {/* Tech stack tags */}
            <div className="stack">
                {project.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                ))}
            </div>

            {/* Action buttons */}
            <div className="actions">
                {/* Demo button (only if demoUrl exists) */}
                {project.demoUrl && (
                    <a
                        href={project.demoUrl}
                        className="btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Demo
                    </a>
                )}

                {/* View Code button (only if codeUrl exists) */}
                {project.codeUrl && (
                    <a
                        href={project.codeUrl}
                        className="btn ghost"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Code
                    </a>
                )}

                {/* Dead / archived label (only if deadLabel exists) */}
                {project.deadLabel && (
                    <a className="btn dead">{project.deadLabel}</a>
                )}

                {/* More details button — opens modal */}
                <button
                    className="btn text"
                    onClick={() => onOpenModal(project.id)}
                >
                    More details
                </button>
            </div>
        </article>
    );
}

export default ProjectCard;
