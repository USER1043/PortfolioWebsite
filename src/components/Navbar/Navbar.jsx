// src/components/Navbar/Navbar.jsx
// Shared navigation bar — renders on every page with active link highlighting
import { NavLink, Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import myPhoto from "../../assets/my-photo.jpg";
import resumePdf from "../../assets/Resume.pdf";

function Navbar() {
    /**
     * React Router's NavLink provides an `isActive` flag
     * which replaces all the original fetch() + DOM classList logic.
     */
    const linkClass = ({ isActive }) =>
        `${styles.navLink} ${isActive ? styles.active : ""}`;

    return (
        <div className={styles.nav}>
            {/* Logo / Avatar area */}
            <Link to="/" className={styles.navLeft}>
                <div className={styles.avatarContainer}>
                    <img
                        src={myPhoto}
                        alt="Prajan"
                        className={styles.avatar}
                    />
                    <div className={styles.statusDot} title="Open to work"></div>
                </div>
                <div>
                    <div className={styles.navName}>Prajan Karthik</div>
                    <div className={styles.navTagline}>Full-stack dev • CS undergrad</div>
                </div>
            </Link>

            {/* Navigation links */}
            <nav className={styles.navLinks}>
                <NavLink to="/" end className={linkClass}>
                    Home
                </NavLink>
                <NavLink to="/work" className={linkClass}>
                    Work
                </NavLink>
                <NavLink to="/skills" className={linkClass}>
                    Skills
                </NavLink>
                <NavLink to="/contact" className={linkClass}>
                    Contact
                </NavLink>
            </nav>

            {/* Hire Me button */}
            <a
                href={resumePdf}
                className={styles.hireBtn}
                target="_blank"
                rel="noopener noreferrer"
            >
                Hire Me ✨
            </a>
        </div>
    );
}

export default Navbar;
