import { m } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Subtle fade/slide-in on scroll. Under prefers-reduced-motion a CSS rule (styles/index.css)
 * shows the content immediately, including in the prerendered HTML.
 */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <m.div
      data-reveal=""
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </m.div>
  );
}
