import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
<<<<<<< HEAD

interface Props {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  duration?: number;
  y?: number;
  blur?: boolean;
}

export function Reveal({ children, width = "100%", delay = 0, duration = 0.5, y = 20, blur = true }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
=======
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  y?: number;
}

export function Reveal({ children, width = "100%", delay = 0, y = 30 }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
<<<<<<< HEAD
          hidden: { opacity: 0, y, filter: blur ? "blur(10px)" : "none" },
          visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
=======
          hidden: { opacity: 0, y },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
      >
        {children}
      </motion.div>
    </div>
  );
}

<<<<<<< HEAD
export function Revealstagger({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
=======
export function Revealstagger({ children, delay = 0.1, width = "100%" }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
  );
}
