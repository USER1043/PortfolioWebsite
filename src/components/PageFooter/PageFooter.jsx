// src/components/PageFooter/PageFooter.jsx
// Reusable footer CTA line (used by Work, Skills, Contact)

function PageFooter({ text, linkText, href }) {
    return (
        <footer className="footer">
            <p>
                {text}{" "}
                <a href={href}>{linkText}</a>
            </p>
        </footer>
    );
}

export default PageFooter;
