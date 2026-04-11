interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#f6f3ee]/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm shadow-stone-200/50 flex items-center w-full px-8 py-3">
      <h1 className="text-xl font-serif font-bold text-primary tracking-tight">{title}</h1>
      {subtitle && <p className="text-[10px] text-stone-400 uppercase tracking-widest ml-3">{subtitle}</p>}
    </header>
  );
}
