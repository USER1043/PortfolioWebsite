// src/components/SideCard/SideCard.jsx
// Right-side "Quick snapshot" card on the Home page

function SideCard() {
    const chips = [
        "Full-stack dev",
        "React",
        "Node + MongoDB",
        "React Native",
        "Security curious",
    ];

    return (
        <aside className="side-card">
            <div className="side-label">Quick snapshot</div>
            <div className="side-main">
                Creative engineer energy<span> × Slight debugging addiction</span>
            </div>
            <p className="side-body">
                I like building things that i actually want - from small tools for
                myself to club projects. Half builder, half curious breaker (only on my
                own Wi-Fi, don&apos;t worry 😄).
            </p>
            <div className="chip-row">
                {chips.map((chip) => (
                    <div className="chip" key={chip}>
                        {chip}
                    </div>
                ))}
            </div>
            <div className="side-footer">
                Looking for <strong>summer 2026 internships</strong> where I can ship
                real features, learn a ton, and bring some playful energy to the team.
            </div>
        </aside>
    );
}

export default SideCard;
