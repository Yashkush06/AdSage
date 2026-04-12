<<<<<<< HEAD
import { useEffect, useRef } from "react";

export function CursorTrail() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={dotRef}
      className="fixed pointer-events-none z-[9999]"
      style={{
        top: 0, left: 0,
        width: 8, height: 8,
        marginLeft: -4, marginTop: -4,
        borderRadius: "50%",
        background: "#FF0032",
        willChange: "transform",
      }}
    />
=======
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CursorTrail() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const clickable = window.getComputedStyle(target).cursor === "pointer" || target.tagName.toLowerCase() === "button" || target.tagName.toLowerCase() === "a";
      setIsHovering(clickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999]"
        style={{
          background: isHovering ? "rgba(232, 135, 106, 0.8)" : "white",
          mixBlendMode: "difference",
          x: mousePos.x - 8,
          y: mousePos.y - 8,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 40 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998]"
        style={{
          border: `1px solid ${isHovering ? "rgba(232, 135, 106, 0.4)" : "rgba(255,255,255,0.2)"}`,
          background: isHovering ? "rgba(232, 135, 106, 0.1)" : "transparent",
          x: mousePos.x - 20,
          y: mousePos.y - 20,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />
    </>
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
  );
}
