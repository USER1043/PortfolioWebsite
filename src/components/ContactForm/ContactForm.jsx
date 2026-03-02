// src/components/ContactForm/ContactForm.jsx
// Contact form that opens the user's mail client (mailto: action)

function ContactForm() {
    return (
        <section className="contact-card">
            <h2 className="contact-header">Send a message</h2>
            <p className="contact-text">
                Whether it&apos;s internships, projects, research, or collaboration —
                I&apos;d love to hear from you.
            </p>

            <form
                className="contact-form"
                action="mailto:prjnkrthk@gmail.com"
                method="POST"
            >
                <input type="text" name="name" placeholder="Your name" required />
                <input type="email" name="email" placeholder="Your email" required />
                <textarea
                    name="message"
                    placeholder="Your message"
                    required
                ></textarea>
                <button type="submit" className="btn-primary">
                    Send message 💬
                </button>
            </form>

            <p className="micro-note">PS: This form opens your mail app.</p>
        </section>
    );
}

export default ContactForm;
