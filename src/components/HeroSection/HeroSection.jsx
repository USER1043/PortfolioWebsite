// src/components/HeroSection/HeroSection.jsx
// Left-side hero card on the Home page — staggered entrance animation via Framer Motion
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Container: orchestrates staggered children
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

// Each child: fades in + slides up
const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

function HeroSection() {
    return (
        <motion.section
            className="card"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="hero-label" variants={itemVariants}>
                <span className="dot-pulse"></span>
                <span>Hey there, 👋</span>
            </motion.div>

            <motion.h1 className="hero-heading" variants={itemVariants}>
                I build <span>full-stack</span> web apps &amp; engineer things that
                actually ship.
            </motion.h1>

            <motion.p className="hero-subtitle" variants={itemVariants}>
                3<sup>rd</sup> year CS student with hands-on experience in web
                development, embedded systems, and systems-level problem solving. I
                enjoy turning messy ideas into clean UI, scalable backend logic, and
                structured apps.
            </motion.p>

            <motion.div className="hero-buttons" variants={itemVariants}>
                <Link to="/work" className="btn-primary">
                    View my projects 🚀
                </Link>
                <Link to="/contact" className="btn-ghost">
                    Say Hi 👋
                </Link>
            </motion.div>

            <motion.div className="hero-meta" variants={itemVariants}>
                <div className="hero-pill">
                    <span>Focus</span> Full-stack Dev, MERN, Security, DevOps
                </div>
                <div className="hero-pill">
                    <span>Currently</span> Exploring full-stack roles and summer internships.
                </div>
            </motion.div>
        </motion.section>
    );
}

export default HeroSection;

