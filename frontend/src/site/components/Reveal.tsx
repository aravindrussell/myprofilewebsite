import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Subtle fade/slide-in on scroll; content is shown immediately when reduced motion is preferred. */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      data-reveal=""
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </m.div>
  );
}
