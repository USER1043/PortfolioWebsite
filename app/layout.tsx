/**
 * @file Root layout — HTML shell, metadata, global styles, and persistent Navbar.
 * @module app/layout
 */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Prajan Karthik — Full-Stack Dev & CS Undergrad",
  description:
    "Portfolio of Prajan Karthik — 3rd year CS student building full-stack web apps, mobile experiments, and more.",
};

// Root shell wraps every page with the persistent Navbar.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper animate-[fadeIn_0.8s_ease-out]">
          {/* Main layout container wrapping navigation and page content */}
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
