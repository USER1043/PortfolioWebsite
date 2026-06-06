/**
 * @file Reusable footer CTA line with an inline link — used by Work, Skills, Contact.
 * @module components/PageFooter
 */

interface PageFooterProps {
  text: string;
  linkText: string;
  href: string;
}

// Renders a centered footer line with a highlighted anchor link.
export default function PageFooter({ text, linkText, href }: PageFooterProps) {
  return (
    <footer className="mt-9 text-center text-[13px] text-[#6b7e75]">
      <p>
        {text}{" "}
        <a href={href} className="text-[#0a8a50] font-semibold no-underline hover:underline">
          {linkText}
        </a>
      </p>
    </footer>
  );
}
