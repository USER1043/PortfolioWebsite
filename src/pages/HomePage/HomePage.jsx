// src/pages/HomePage/HomePage.jsx
// Home page — Hero + SideCard grid, "What I Do" section, footer note
import styles from "./HomePage.module.css";
import HeroSection from "../../components/HeroSection/HeroSection";
import SideCard from "../../components/SideCard/SideCard";
import MiniCard from "../../components/MiniCard/MiniCard";
import { miniCards } from "../../data/miniCards";

function HomePage() {
    return (
        <>
            {/* Main two-column grid: Hero left, Snapshot right */}
            <main className={styles.grid}>
                <HeroSection />
                <SideCard />
            </main>

            {/* "What I Do" section */}
            <section className={styles.section} id="skills">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>What I do</h2>
                    <p className={styles.sectionSub}>Things i have actually worked on.</p>
                </div>

                <div className="card-row">
                    {miniCards.map((card) => (
                        <MiniCard key={card.title} {...card} />
                    ))}
                </div>
            </section>

            {/* Footer tagline */}
            <footer className={styles.footerNote} id="contact">
                <div className={styles.footerDot}></div>
                <span>
                    Built by me, with a mix of curiosity, caffeine, and a healthy respect
                    for semicolons.
                </span>
            </footer>
        </>
    );
}

export default HomePage;
