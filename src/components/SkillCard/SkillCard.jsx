// src/components/SkillCard/SkillCard.jsx
// Single skill card for the Skills page — rendered from skill data

function SkillCard({ skill, onOpenModal }) {
    return (
        <div className="skill-card">
            <h2 className="skill-header">{skill.title}</h2>
            <p className="skill-desc">{skill.description}</p>
            <div className="skill-chips">
                {skill.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                ))}
            </div>
            {/* Modal button is commented out in the original HTML,
          but we keep it ready in case you want to enable it. */}
            {/* <button
        className="skill-detail-btn"
        onClick={() => onOpenModal(skill.id)}
      >
        More details
      </button> */}
        </div>
    );
}

export default SkillCard;
