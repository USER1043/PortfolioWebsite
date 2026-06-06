/**
 * @file Type definitions and data for all social link cards on the Contact page.
 * @module data/socials
 */

export interface Social {
  title: string;
  description: string;
  linkText: string;
  href: string;
}

export const socials: Social[] = [
  {
    title: "Email",
    description: "Fastest and easiest way to reach me.",
    linkText: "Send email →",
    href: "mailto:prjnkrthk@gmail.com",
  },
  {
    title: "LinkedIn",
    description: "Say hi or talk about opportunities.",
    linkText: "Open LinkedIn →",
    href: "https://www.linkedin.com/in/prajan-karthik",
  },
  {
    title: "GitHub",
    description: "See things I've been hacking on.",
    linkText: "View repos →",
    href: "https://github.com/USER1043",
  },
];
