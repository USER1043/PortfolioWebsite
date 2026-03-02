// src/components/HeroSection/HeroSection.jsx
// Left-side hero card on the Home page
import { Link } from "react-router-dom";

function HeroSection() {
    return (
        <section className="card">
            <div className="hero-label">
                <span className="dot-pulse"></span>
                <span>Hey there, 👋</span>
            </div>

            <h1 className="hero-heading">
                I build <span>full-stack</span> web apps engineer things that actually
                ship.
            </h1>

            <p className="hero-subtitle">
                3<sup>rd</sup>rd year CS student with hands-on experience in web
                development, embedded systems, and systems-level problem solving. I
                enjoy turning messy ideas into clean UI, scalable backend logic, and
                structured apps.
            </p>

            <div className="hero-buttons">
                <Link to="/work" className="btn-primary">
                    View my projects 🚀
                </Link>
                <Link to="/contact" className="btn-ghost">
                    Say Hi 👋
                </Link>
            </div>

            <div className="hero-meta">
                <div className="hero-pill">
                    <span>Focus</span> Full-stack Dev, MERN, Security, DevOps
                </div>
                <div className="hero-pill">
                    <span>Currently</span> Exploring full-stack roles and summer
                    internships.
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
