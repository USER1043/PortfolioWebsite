// src/pages/ContactPage/ContactPage.jsx
// Contact page — form + social cards grid
import "./ContactPage.module.css";
import PageHeader from "../../components/PageHeader/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import ContactForm from "../../components/ContactForm/ContactForm";
import SocialCard from "../../components/SocialCard/SocialCard";
import { socials } from "../../data/socials";

function ContactPage() {
    return (
        <>
            <PageHeader
                title="Let's talk! 🤝"
                subtitle="If something here sparked an idea — reach out, I don't bite."
            />

            <ContactForm />

            {/* Social links grid */}
            <section className="social-grid">
                {socials.map((social) => (
                    <SocialCard key={social.title} {...social} />
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
