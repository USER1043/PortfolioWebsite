"use client";
/**
 * @file Glassmorphic modal dialog — controlled via isOpen/onClose props.
 * @module components/Modal
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  points: string[];
  tech: string;
}

// Renders a backdrop + dialog; clicking the backdrop closes the modal.
export default function Modal({ isOpen, onClose, title, subtitle, points, tech }: ModalProps) {
  // Close only when the backdrop itself is clicked.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.35)] z-50 transition-opacity duration-[180ms] ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={handleBackdropClick}
    >
      <div className="max-w-[520px] w-[90%] bg-[rgba(250,255,251,0.92)] rounded-[26px] p-5 border border-[rgba(227,237,230,0.9)] shadow-[0_26px_70px_rgba(15,23,42,0.4)] backdrop-blur-xl relative">
        <button
          className="absolute top-2.5 right-3 w-[26px] h-[26px] rounded-full border-none cursor-pointer bg-[rgba(229,243,236,0.9)] flex items-center justify-center text-lg leading-none text-[#334155] hover:bg-[rgba(209,250,229,1)] hover:-translate-y-px transition-all duration-[160ms]"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-[13px] text-[#6b7e75] mb-2">{subtitle}</p>
        <ul className="ml-[18px] mb-2.5 text-[13px] text-[#6b7e75] space-y-1">
          {points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        <p className="text-[12px] text-[#0a8a50] font-medium">Tech: {tech}</p>
      </div>
    </div>
  );
}
