/**
 * @file Contact page — form + social link cards grid.
 * @module app/contact/page
 */
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader/PageHeader";
import PageFooter from "@/components/PageFooter/PageFooter";
import ContactForm from "@/components/ContactForm/ContactForm";
import SocialCard from "@/components/SocialCard/SocialCard";
import FadeInScroll from "@/components/FadeInScroll/FadeInScroll";
import { socials } from "@/data/socials";

export const metadata: Metadata = {
  title: "Contact — Prajan Karthik",
  description: "Get in touch with Prajan Karthik via email, LinkedIn, or GitHub.",
};

// SSG contact page — pre-rendered at build time; no client-side state needed.
export default function ContactPage() {
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

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
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
