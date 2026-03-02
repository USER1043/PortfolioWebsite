// src/data/skills.js
// Data for the 5 skill cards + their modal details on the Skills page

export const skills = [
    {
        id: "skill-fullstack",
        title: "Full-stack Development",
        description:
            "I enjoy building real apps with auth, routing, DB persistence and clean UI.",
        chips: ["React", "Node.js", "Tailwind", "MongoDB"],
        modal: {
            title: "Full-stack Engineering",
            subtitle: "Core interests include:",
            points: [
                "REST APIs, routing, JWT auth",
                "Protected dashboards & dynamic UI",
                "Clean component structure / state management",
                "DB modeling for habits, sessions, logs",
                "Deployment & basic CI/CD setup",
            ],
            tech: "React, Next.js, Node, Tailwind, MongoDB",
        },
    },
    {
        id: "skill-mobile",
        title: "Mobile Engineering",
        description:
            "Mainly experimental apps for personal usage — tracking, reminders, small tools.",
        chips: ["React Native", "Expo", "PostgreSQL"],
        modal: {
            title: "Mobile Engineering",
            subtitle: "Better UX through tiny helpful apps:",
            points: [
                "Daily tracking tools, notes, reminders",
                "Offline-first storage using SQLite",
                "Testing on real devices & expo builds",
            ],
            tech: "React Native, Expo, SQLite",
        },
    },
    {
        id: "skill-db",
        title: "Databases & Architecture",
        description:
            "Designing schemas, optimizing reads, structuring models that don't become nightmares.",
        chips: ["MongoDB", "PostgreSQL", "ODM"],
        modal: {
            title: "Database Design",
            subtitle: "Things I enjoy about DB & architecture:",
            points: [
                "Entity relationships & indexing decisions",
                "High-volume reads vs normalized schemas",
                "Schema evolution without pain",
            ],
            tech: "MongoDB, PostgreSQL, NoSQL design philosophies",
        },
    },
    {
        id: "skill-security",
        title: "Security",
        description:
            "Beginner ethical hacking hobby — experimenting safely on my own networks.",
        chips: ["Linux", "Networking", "CTF basics"],
        modal: {
            title: "Security Curiosity",
            subtitle: "Learning mindset rather than production expertise:",
            points: [
                "Safe local test labs for ethical hacking",
                "Networking analysis & basic tooling",
                "Notes from CTFs & beginners security topics",
            ],
            tech: "Linux, Python, networking tools",
        },
    },
    {
        id: "skill-team",
        title: "Team Experience",
        description:
            "Built features collaboratively, supported club members, led small web teams.",
        chips: ["Git", "CI/CD", "Debugging", "Team reviews"],
        modal: {
            title: "Team Experience",
            subtitle: "Things I've naturally practiced:",
            points: [
                "Debugging others' code during sprints",
                "Helping unblock teammates during builds",
                "Small feature ownership & planning",
                "Helping onboard contributors",
            ],
            tech: "Git, CI/CD, reviews, pair debugging",
        },
    },
];
