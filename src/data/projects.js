// src/data/projects.js
// Data for all 9 project cards + their modal details on the Work page

export const projects = [
    {
        id: "project-e-commerce",
        title: "Product Store",
        badge: "Featured",
        description:
            "A full-stack e-commerce application with product catalogue, authentication, cart management, and user dashboards.",
        stack: ["React", "Node.js", "MongoDB", "Express", "Render"],
        demoUrl: "https://mern-crash-course-7h57.onrender.com",
        codeUrl: "https://github.com/USER1043/Product-Store",
        modal: {
            title: "E-commerce website",
            subtitle: "Key Points",
            points: [
                "Designed a responsive UI using React and Chakra UI for clean user experience.",
                "Built and deployed backend services with MongoDB and Express.",
                "Implemented secure authentication and reliable hosting using Render.",
            ],
            tech: "React, Node.js, MongoDB, Express, Render",
        },
    },
    {
        id: "project-expense-flow",
        title: "Spenza (Mobile)",
        badge: null,
        description:
            "A React Native app for tracking expenses and visualizing spending patterns.",
        stack: ["React Native", "Expo", "PostgreSQL", "Redis", "Clerk", "Render"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/spenza-frontend",
        modal: {
            title: "Spenza (Mobile)",
            subtitle: "Key Points:",
            points: [
                "Implemented secure authentication with Clerk and rate-limiting using.",
                "Redis Backend built with PostgreSQL and Express, deployed on Render.",
                "Designed a minimal mobile-first UI using React Native.",
            ],
            tech: "React Native, Expo, PostgreSQL, Redis, Clerk, Render",
        },
    },
    {
        id: "project-devops",
        title: "Intel IoT Club — Web DevOps",
        badge: null,
        description:
            "Supported the club's project development and with routine deployment DevOps checks.",
        stack: ["MERN DevOps", "Debugging", "Team Collaboration"],
        demoUrl: null,
        codeUrl: null,
        deadLabel: "Currently Archived",
        modal: {
            title: "Intel IoT - Web DevOps",
            subtitle: "Key Points:",
            points: [
                "Fixed a critical authentication vulnerability by implementing protected routes.",
                "Supported deployments, CI/CD maintenance, and debugging.",
                "Worked with members and mentored contributors informally.",
            ],
            tech: "MERN Devops, Debugging, Team Collaboration",
        },
    },
    {
        id: "project-dsa",
        title: "Data Structure and Algorithms",
        badge: null,
        description:
            "Algorithm-focused utility development with measurable complexity improvements.",
        stack: ["Python"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/DSA-Project",
        modal: {
            title: "Data Structure and Algorithms",
            subtitle: "Key Points:",
            points: [
                "Implemented data structures like Trie with insert, search operations.",
                "Implemented features like autocorrect, autocomplete and substring match",
                "Refactored routines for modularity and clarity.",
            ],
            tech: "Python",
        },
    },
    {
        id: "project-chrome-dino",
        title: "Chrome Dino",
        badge: null,
        description:
            "A faithful recreation of the classic Chrome \"Dino\" offline game, built in Java using JFrame / Swing. Players control a dinosaur that jumps over obstacles in a side-scrolling desert environment.",
        stack: ["Java", "Swing UI Library"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/ChromeDino",
        modal: {
            title: "Chrome Dino",
            subtitle: "Key Points:",
            points: [
                "Implements a 2D game loop, gravity & jump physics, obstacle spawning and collision detection.",
                "Includes sprite-based rendering (dinosaur, obstacles, background), score tracking, and increasing game difficulty over time..",
                "Serves as a practice of full-stack thinking in pure Java — handling user input, rendering, game logic, and window management manually..",
            ],
            tech: "JAVA, Swing UI Library",
        },
    },
    {
        id: "project-comp-graphics",
        title: "2D Underwater Scene",
        badge: null,
        description:
            "A Graphics program that creates an animated underwater scene, all rendered using fundamental computer graphics algorithms.",
        stack: ["C++", "OpenGL", "GLUT"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/CompGraphicsProject",
        modal: {
            title: "2D Underwater scene",
            subtitle: "Key Points:",
            points: [
                "Implements Bresenham's line drawing, midpoint circle, and scanline polygon filling to demonstrate rasterization fundamentals.",
                "Demonstrates Cohen-Sutherland line clipping with color-coded output to visualize accepted vs rejected segments. .",
                "Showcases 2D geometric transformations — translation, rotation, scaling, shearing, and reflection — with dynamically rendered shapes..",
            ],
            tech: "C++, OpenGL, GLUT",
        },
    },
    {
        id: "project-human-detect",
        title: "Human detection in Video for Embedded System",
        badge: null,
        description:
            "A real-time computer-vision system for detecting humans in recorded video using YOLOv8 object detection. The video frames are annotated dynamically, providing instant visual feedback on detected persons.",
        stack: ["Python", "YOLOv8", "OpenCV"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/ES_RecordedFootage_Human_Detection",
        modal: {
            title: "Human Detection for Embedded System",
            subtitle: "Key Points:",
            points: [
                "Integrates YOLOv8 for precise person-class detection with confidence filtering.",
                "Processes video streams frame-by-frame using OpenCV, automatically drawing bounding boxes for detected humans..",
                "Simple and reliable pipeline for demos, research, surveillance prototypes, or security monitoring.",
            ],
            tech: "Python, YOLOv8, OpenCV",
        },
    },
    {
        id: "project-movie-view",
        title: "Movie Viewer",
        badge: null,
        description:
            "A website to browse, search, and view details about movies — acting as a personal movie database viewer for exploring film metadata and maybe tracking favorites or watch-list.",
        stack: ["React", "React Router", "Vite"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/MovieViewer",
        modal: {
            title: "Movie Viewer",
            subtitle: "Key Points:",
            points: [
                "Allows searching and browsing movies, displaying metadata (title, year, description, ratings, etc.).",
                "Supports filtering (by genre, year, etc.) and a favorites functionality for movies.",
                "Clean UI that makes it easy to explore a large movie dataset, enhancing user experience for film lovers...",
            ],
            tech: "React, React Router, Vite",
        },
    },
    {
        id: "project-bluetooth-car",
        title: "Bluetooth Controlled Arduino Car",
        badge: null,
        description:
            "A hardware-level embedded (arduino) car programmed in C++ using modular motor and sensor components.",
        stack: ["Arduino", "C++"],
        demoUrl: null,
        codeUrl: "https://github.com/USER1043/Car-with-Arduino",
        modal: {
            title: "Bluetooth Controlled Arduino Car",
            subtitle: "Key Points:",
            points: [
                "Modular Motor Control Using Structured Pin Mapping.",
                "Ultrasonic Distance Measurement Encapsulated for Safety & Reusability.",
                "Clean Separation of Hardware Logic via Header Abstraction.",
            ],
            tech: "Arduino, C++",
        },
    },
];
