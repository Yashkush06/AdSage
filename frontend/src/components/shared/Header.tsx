import { useAppStore } from "../../lib/store";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
}

export function Header({ title, subtitle, searchPlaceholder = "Search..." }: HeaderProps) {
  const { user } = useAppStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      initial={false}
      animate={{ 
        backgroundColor: scrolled ? "rgba(11, 12, 17, 0.8)" : "rgba(11, 12, 17, 0)",
        backdropFilter: scrolled ? "blur(32px) saturate(180%)" : "blur(0px) saturate(100%)",
        borderBottomColor: scrolled ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0)"
      }}
      className="sticky top-0 z-40 border-b transition-colors flex justify-between items-center w-full px-8 py-4"
    >
      <div className="flex items-center gap-8 flex-1">
        <div>
          <h1 className="text-xl font-serif font-bold text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{subtitle}</p>}
        </div>
        
        <div className="relative max-w-md w-full ml-4 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-lg group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-outline-variant/10 rounded-full focus:ring-1 focus:ring-primary/40 text-sm placeholder:text-stone-500 outline-none transition-all" 
            placeholder={searchPlaceholder} 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-stone-400 hover:bg-white/5 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-stone-400 hover:bg-white/5 transition-colors rounded-full">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-on-surface leading-tight">
              {user?.business_name || "Arthur Sterling"}
            </p>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">
              {user?.industry || "Archivist Pro"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center border border-outline-variant/20">
            <span className="text-white text-sm font-bold">
              {(user?.business_name || "A").charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
