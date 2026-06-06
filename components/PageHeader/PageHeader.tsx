/**
 * @file Reusable page heading block used by Work, Skills, and Contact pages.
 * @module components/PageHeader
 */

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

// Renders an h1 title and a muted subtitle paragraph.
export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-[28px] font-bold mb-1.5">{title}</h1>
      <p className="text-sm text-[#6b7e75] mb-7">{subtitle}</p>
    </>
  );
}
