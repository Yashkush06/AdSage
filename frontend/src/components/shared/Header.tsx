interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-[#050505] border-b border-white/5 flex items-center w-full px-8 py-4">
      <h1 className="text-xl font-serif font-black text-[#FF0032] italic tracking-tighter uppercase">{title}</h1>
      {subtitle && <p className="text-[9px] text-[#00F0FF]/40 font-bold uppercase tracking-[0.4em] ml-4 pt-1">{subtitle}</p>}
    </header>
  );
}
