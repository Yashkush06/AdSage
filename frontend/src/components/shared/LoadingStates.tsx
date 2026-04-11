import { motion } from "framer-motion";

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-primary"
      />
      <motion.div
        animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        className="absolute inset-0 rounded-full border-2 border-primary"
      />
      <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#FF3B3B]" />
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-white/5 rounded animate-pulse" 
          style={{ width: `${60 + Math.random() * 40}%` }} 
        />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-fade-in">
      <LoadingSpinner size={48} />
      <div className="space-y-1 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary">Neural Sync</p>
        <p className="text-xs text-stone-500 font-medium italic">Establishing observatory link...</p>
      </div>
    </div>
  );
}
