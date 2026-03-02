// src/components/SocialCard/SocialCard.jsx
// Single social link card for the Contact page

function SocialCard({ title, description, linkText, href }) {
    return (
        <a
            className="social-card"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="link">{linkText}</span>
        </a>
    );
}

export default SocialCard;
