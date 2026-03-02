// src/components/MiniCard/MiniCard.jsx
// Small "What I Do" card — rendered from data via .map()

function MiniCard({ icon, title, body, tags }) {
    return (
        <article className="mini-card">
            <div className="mini-top">
                <div className="mini-icon">{icon}</div>
                <div className="mini-title">{title}</div>
            </div>
            <p className="mini-body">{body}</p>
            <div className="mini-tags">
                {tags.map((tag) => (
                    <span className="mini-tag" key={tag}>
                        {tag}
                    </span>
                ))}
            </div>
        </article>
    );
}

export default MiniCard;
