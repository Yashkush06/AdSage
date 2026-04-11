import { useAppStore } from "../../lib/store";

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
}

export function Header({ title, subtitle, searchPlaceholder = "Search..." }: HeaderProps) {
  const { user } = useAppStore();

  return (
    <header className="sticky top-0 z-40 bg-[#f6f3ee]/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm shadow-stone-200/50 flex justify-between items-center w-full px-8 py-3">
      <div className="flex items-center gap-8 flex-1">
        <div>
          <h1 className="text-xl font-serif font-bold text-primary dark:text-[#a8b5a2] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[10px] text-stone-400 uppercase tracking-widest">{subtitle}</p>}
        </div>
        
        <div className="relative max-w-md w-full ml-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm placeholder:text-stone-400 outline-none" 
            placeholder={searchPlaceholder} 
            type="text"
          />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-outline-variant/40"></div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-stone-500 hover:bg-stone-100/50 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-stone-500 hover:bg-stone-100/50 transition-colors rounded-full">
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
    </header>
  );
}
