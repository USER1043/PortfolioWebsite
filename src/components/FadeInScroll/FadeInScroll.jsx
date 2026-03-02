// src/components/FadeInScroll/FadeInScroll.jsx
// Reusable scroll-triggered fade-in + slide-up wrapper using Framer Motion.
// Usage: wrap any child element in <FadeInScroll> to animate it on scroll.

import { motion } from "framer-motion";

const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

/**
 * FadeInScroll — wraps children with a subtle fade-in + slide-up animation
 * that triggers once when the element enters the viewport.
 *
 * @param {React.ReactNode} children  - The content to animate
 * @param {number}          delay     - Optional stagger delay in seconds (default 0)
 * @param {string}          className - Optional CSS class forwarded to the wrapper div
 */
function FadeInScroll({ children, delay = 0, className = "" }) {
    return (
        <motion.div
            className={className}
            variants={fadeUpVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay }}
        >
            {children}
        </motion.div>
    );
}

export default FadeInScroll;
