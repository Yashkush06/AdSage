import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function AppStartup({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((v) => {
        if (v >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        if (Math.random() > 0.9) setGlitch(true);
        else setTimeout(() => setGlitch(false), 50);
        return v + (Math.random() > 0.8 ? 5 : 2);
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 4,
        filter: "blur(20px) contrast(200%)",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
      }}
      className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #FF0032 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
        <motion.div 
          animate={{ y: ["0%", "100%", "0%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF0032]/5 to-transparent h-1/2"
        />
      </div>

      <div className={`relative flex flex-col items-center gap-12 max-w-md w-full transition-all ${glitch ? 'translate-x-[2px] skew-x-2 grayscale invert' : ''}`}>
        {/* Central Neural Node */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-40 h-40 flex items-center justify-center"
        >
          {/* Liquid Rings */}
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF0032]/20" 
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-10px] rounded-full border border-dashed border-[#00F0FF]/10" 
          />
          
          <div className="relative">
            <span className="material-symbols-outlined text-7xl text-[#FF0032] shadow-[0_0_30px_rgba(255,0,50,0.5)]">
              emergency_recording
            </span>
            {glitch && <span className="absolute inset-0 material-symbols-outlined text-7xl text-[#00F0FF] translate-x-1 opacity-50">emergency_recording</span>}
          </div>
        </motion.div>

        <div className="space-y-6 w-full">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-serif text-3xl font-black italic tracking-tighter text-white uppercase"
              >
                Neural Booting
              </motion.h1>
              <p className="text-[9px] uppercase font-black tracking-[0.5em] text-[#FF0032] animate-pulse">Syncing with spider-network.vh</p>
            </div>
            <div className="font-mono text-[#00F0FF] text-2xl font-black italic tracking-tighter">
              {progress}<span className="text-xs opacity-50">%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/5 rounded-none overflow-hidden relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#FF0032] to-[#00F0FF]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Scanned line */}
            <motion.div 
              animate={{ left: ["-10%", "110%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-8 bg-white/40 blur-sm"
            />
          </div>

          {/* Terminal-like output */}
          <div className="h-4 flex items-center gap-2">
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-2 h-4 bg-[#FF0032]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {progress < 25 ? "Mounting GPU Kernels..." : progress < 50 ? "Establishing Neural Link..." : progress < 75 ? "Syncing Agency Weights..." : "Protocol Master Active."}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
