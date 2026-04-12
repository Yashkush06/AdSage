import os
import re

directory = 'd:/projects/CodePunk/AdSage/frontend/src'

patterns = [
    # Typography
    (r'font-serif text-5xl font-black tracking-tighter uppercase italic leading-none', 'text-4xl font-bold tracking-tight text-white leading-none'),
    (r'font-serif text-5xl font-black tracking-tighter text-white uppercase italic leading-none', 'text-4xl font-bold tracking-tight text-white leading-none'),
    (r'font-serif text-4xl font-black tracking-tighter text-white uppercase italic', 'text-3xl font-bold tracking-tight text-white'),
    (r'font-serif text-4xl font-bold tracking-tight text-white uppercase italic', 'text-3xl font-bold tracking-tight text-white'),
    (r'font-serif text-2xl font-black uppercase italic tracking-tighter', 'text-xl font-semibold text-white tracking-tight'),
    (r'font-serif text-2xl text-white font-black italic tracking-tighter leading-none uppercase', 'text-xl font-bold text-white tracking-tight leading-none'),
    (r'text-4xl font-black font-serif text-white uppercase italic tracking-tighter', 'text-3xl font-bold text-white tracking-tight'),
    (r'text-3xl font-black font-serif text-white tracking-tighter uppercase italic', 'text-2xl font-bold text-white tracking-tight'),
    (r'text-2xl font-black font-serif text-white mb-3 uppercase italic tracking-tighter', 'text-xl font-semibold text-white mb-2'),
    (r'text-2xl font-black font-serif text-white/60 mb-3 uppercase italic tracking-tighter', 'text-xl font-semibold text-white/70 mb-2'),
    (r'font-serif text-2xl font-bold text-white', 'text-xl font-semibold text-white'),
    (r'font-serif text-2xl font-bold', 'text-xl font-semibold text-white'),
    (r'font-serif text-xl font-bold text-white', 'text-lg font-semibold text-white'),
    (r'font-serif font-bold text-base', 'text-base font-semibold'),
    (r'text-base font-serif font-bold text-white leading-snug', 'text-base font-semibold text-white leading-snug'),
    (r'text-2xl font-serif font-bold', 'text-xl font-semibold'),
    (r'text-3xl font-serif font-black text-white italic mb-4 uppercase tracking-tighter', 'text-2xl font-bold text-white mb-3'),
    (r'text-6xl font-serif font-black text-white italic', 'text-5xl font-bold text-white'),
    (r'font-serif font-black text-white italic tracking-tighter', 'font-bold text-white tracking-tight'),
    
    # Text styles
    (r'text-\[\#00F0FF\] font-bold uppercase tracking-\[0\.4em\] text-\[10px\] opacity-60', 'text-sm font-medium text-white/50'),
    (r'text-\[\#00F0FF\]/60 font-bold uppercase tracking-\[0\.25em\] text-\[10px\]', 'text-sm font-medium text-white/50'),
    (r'text-\[\#FF0032\]/60 font-black uppercase tracking-\[0\.2em\] text-\[8px\] mt-1', 'text-sm font-medium text-white/50 mt-1'),
    (r'text-\[\#00F0FF\]/60 font-black uppercase tracking-\[0\.2em\] text-\[8px\] mt-1', 'text-sm font-medium text-white/50 mt-1'),
    (r'text-\[10px\] font-black uppercase tracking-\[0\.5em\] text-white/20 mb-4 italic', 'text-xs font-semibold text-white/50 uppercase tracking-widest mb-4'),
    (r'text-\[9px\] font-black text-\[\#FF0032\] uppercase tracking-\[0\.3em\] italic', 'text-xs font-semibold text-white/50 uppercase tracking-wider'),
    (r'text-\[9px\] font-black text-white/10 py-4 uppercase tracking-\[0\.5em\]', 'text-xs font-medium text-white/30 py-4'),
    (r'text-on-surface-variant/40 text-\[10px\] font-sans uppercase tracking-\[0\.2em\]', 'text-white/40 text-xs font-medium'),
    (r'font-black text-\[10px\] uppercase tracking-\[0\.5em\]', 'font-semibold text-xs uppercase tracking-widest'),
    (r'font-black uppercase tracking-\[0\.3em\]', 'font-semibold'),
    
    # Subtitles & Labels
    (r'text-\[9px\] text-\[\#00F0FF\]/40 font-bold uppercase tracking-\[0\.4em\]', 'text-sm font-medium text-white/50'),
    (r'text-\[10px\] uppercase font-black text-white/40 tracking-\[0\.3em\]', 'text-xs font-semibold uppercase text-white/50 tracking-wider'),

    # Buttons
    (r'px-8 py-3 bg-\[\#FF0032\] text-white rounded-none text-\[10px\] font-black uppercase tracking-\[0\.5em\] shadow-\[0_0_30px_rgba\(255,0,50,0\.3\)\] hover-glitch italic', 'px-6 py-2.5 bg-[#FF0032] text-white rounded-xl font-medium shadow-md shadow-[#FF0032]/20 hover:shadow-lg hover:shadow-[#FF0032]/30 transition-all'),
    (r'px-8 py-3 bg-\[\#FF0032\] text-white font-black rounded-none text-\[10px\] uppercase tracking-\[0\.3em\] shadow-\[0_0_20px_rgba\(255,0,50,0\.3\)\] hover-glitch active:scale-\[0\.98\] transition-all disabled:opacity-50', 'px-6 py-2.5 bg-[#FF0032] text-white rounded-xl font-medium shadow-md transition-all active:scale-95 disabled:opacity-50'),
    (r'bg-\[\#FF0032\] text-white font-black rounded-none py-5 mt-4 text-\[11px\] uppercase tracking-\[0\.5em\] shadow-\[0_0_30px_rgba\(255,0,50,0\.3\)\] hover-glitch transition-all disabled:opacity-50 italic', 'w-full bg-[#FF0032] text-white font-medium rounded-xl py-3 mt-4 shadow-md transition-all disabled:opacity-50'),
    (r'px-6 py-2 bg-\[\#FF0032\] border border-\[\#FF0032\] text-white rounded-none text-\[10px\] font-black uppercase tracking-\[0\.3em\] hover:bg-\[\#FF0032\]/80 transition-all flex items-center gap-2 shadow-\[0_0_20px_rgba\(255,0,50,0\.3\)\] disabled:opacity-50 italic', 'px-4 py-2 bg-[#FF0032] text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50'),
    (r'px-6 py-2 bg-white/5 border border-white/10 text-white/50 rounded-none text-\[10px\] font-black uppercase tracking-\[0\.3em\] hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 italic', 'px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl font-medium text-sm hover:text-white hover:bg-white/10 transition-all flex items-center gap-2'),
    (r'px-6 py-2 bg-\[\#FF0032\] text-white rounded-none text-\[10px\] font-black uppercase tracking-\[\.2em\] hover-glitch transition-all shadow-\[0_0_15px_rgba\(255,0,50,0\.3\)\] disabled:opacity-50', 'px-5 py-2 bg-[#FF0032] text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50'),

    # Glitch / Shapes
    (r'hover-glitch', ''),
    (r' rounded-none', ' rounded-xl'),
    (r' italic', ''),
    (r'"font-serif', '"font-sans'),
]

total_files = 0
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for pat, repl in patterns:
                content = re.sub(pat, repl, content)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                total_files += 1

print(f"Updated {total_files} files.")
