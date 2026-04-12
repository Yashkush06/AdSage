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
  );
}
