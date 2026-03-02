// src/components/SideCard/SideCard.jsx
// Right-side "Quick snapshot" card on the Home page — slides in from right on load
import { motion } from "framer-motion";

function SideCard() {
    const chips = [
        "Full-stack dev",
        "React",
        "Node + MongoDB",
        "React Native",
        "Security curious",
    ];

    return (
        <motion.aside
            className="side-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
        >
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
        </motion.aside>
    );
}

export default SideCard;

