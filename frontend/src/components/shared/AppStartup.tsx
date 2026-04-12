import { useEffect } from "react";
import { motion } from "framer-motion";

export function AppStartup({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-[#E8876A] blur-[150px] opacity-20 rounded-full animate-pulse" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          <span className="material-symbols-outlined text-5xl" style={{ color: "#E8876A" }}>
            analytics
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">AdSage AI</h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.30)" }}>Initializing Subsystems...</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden mt-4" style={{ background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #E8876A, #C36244)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
