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
        <div className="max-w-[1120px] mx-auto px-7 pt-8 pb-[72px] flex-1 w-full flex flex-col animate-[fadeIn_0.8s_ease-out]">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
