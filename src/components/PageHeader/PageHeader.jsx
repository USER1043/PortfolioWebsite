// src/components/PageHeader/PageHeader.jsx
// Reusable page title + subtitle header (used by Work, Skills, Contact)

function PageHeader({ title, subtitle }) {
    return (
        <>
            <h1 className="title">{title}</h1>
            <p className="subtitle">{subtitle}</p>
        </>
    );
}

export default PageHeader;
