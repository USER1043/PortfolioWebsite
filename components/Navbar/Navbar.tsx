"use client";
/**
 * @file Persistent navigation bar with active link highlighting via usePathname.
 * @module components/Navbar
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/",        label: "Home"    },
  { href: "/work",    label: "Work"    },
  { href: "/skills",  label: "Skills"  },
  { href: "/contact", label: "Contact" },
] as const;

// Returns Tailwind classes for a nav link based on whether it is the active route.
function linkClass(pathname: string, href: string): string {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return isActive
    ? "px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-white text-[#0a8a50] shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-200"
    : "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[#6b7e75] hover:bg-slate-100/10 hover:text-[#1f2a26] transition-all duration-200";
}

// Main navigation bar rendered on every page.
export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="flex justify-between items-center mb-8 py-2">
      {/* Avatar + name */}
      <Link href="/" className="flex gap-3 items-center no-underline text-inherit hover:opacity-80 transition-opacity duration-200">
        <div className="relative">
          <Image
            src="/my-photo.jpg"
            alt="Prajan"
            width={44}
            height={44}
            className="rounded-full object-cover bg-slate-200 border border-black/[0.08]"
            priority
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-white rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.1)]" title="Open to work" />
        </div>
        <div>
          <div className="font-bold text-base leading-tight text-[#1f2a26]">Prajan Karthik</div>
          <div className="text-xs text-[#6b7e75] font-medium">Full-stack dev • CS undergrad</div>
        </div>
      </Link>

      {/* Nav links pill */}
      <nav className="flex gap-2 bg-white/50 px-1.5 py-1.5 rounded-full border border-black/[0.03]">
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass(pathname, href)}>
            {label}
          </Link>
        ))}
      </nav>

      {/* Hire Me button */}
      <a
        href="/Resume.pdf"
        className="bg-gradient-to-br from-[#0faf64] to-[#0a8a50] text-white px-5 py-2 rounded-full text-[13.5px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:brightness-110 transition-all duration-200 whitespace-nowrap no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hire Me ✨
      </a>
    </div>
  );
}
