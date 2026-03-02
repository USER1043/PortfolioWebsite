// src/pages/ContactPage/ContactPage.jsx
// Contact page — form + social cards grid
import "./ContactPage.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import ContactForm from "../../components/ContactForm/ContactForm";
import SocialCard from "../../components/SocialCard/SocialCard";
import FadeInScroll from "../../components/FadeInScroll/FadeInScroll";
import { socials } from "../../data/socials";

function ContactPage() {
    return (
        <>
            <FadeInScroll>
                <PageHeader
                    title="Let's talk! 🤝"
                    subtitle="If something here sparked an idea — reach out, I don't bite."
                />
            </FadeInScroll>

            <FadeInScroll delay={0.1}>
                <ContactForm />
            </FadeInScroll>

            {/* Social links grid */}
            <section className="social-grid">
                {socials.map((social, index) => (
                    <FadeInScroll key={social.title} delay={index * 0.1}>
                        <SocialCard {...social} />
                    </FadeInScroll>
                ))}
            </section>

            <PageFooter
                text="Prefer Discord/Whatsapp? →"
                linkText="Just ask 😊"
                href="mailto:prjnkrthk@gmail.com?subject=Hey Prajan, can I get your Discord/WhatsApp?"
            />
        </>
    );
}

export default ContactPage;
