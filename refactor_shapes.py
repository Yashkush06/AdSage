import os
import re

directory = 'd:/projects/CodePunk/AdSage/frontend/src'

patterns = [
    # Buttons
    (r'px-8 py-3 bg-\[\#FF0032\] text-white rounded-none text-\[10px\] font-black uppercase tracking-\[0\.5em\] shadow-\[0_0_30px_rgba\(255,0,50,0\.3\)\] hover-glitch italic', 'px-6 py-2.5 bg-[#FF0032] text-white rounded-xl font-medium shadow-md shadow-[#FF0032]/20 hover:shadow-lg hover:shadow-[#FF0032]/30 transition-all'),
    (r'px-8 py-3 bg-\[\#FF0032\] text-white font-black rounded-none text-\[10px\] uppercase tracking-\[0\.3em\] shadow-\[0_0_20px_rgba\(255,0,50,0\.3\)\] hover-glitch active:scale-\[0\.98\] transition-all disabled:opacity-50', 'px-6 py-2.5 bg-[#FF0032] text-white rounded-xl font-medium shadow-md transition-all active:scale-95 disabled:opacity-50'),
    (r'bg-\[\#FF0032\] text-white font-black rounded-none py-5 mt-4 text-\[11px\] uppercase tracking-\[0\.5em\] shadow-\[0_0_30px_rgba\(255,0,50,0\.3\)\] hover-glitch transition-all disabled:opacity-50 italic', 'w-full bg-[#FF0032] text-white font-medium rounded-xl py-3 mt-4 shadow-md transition-all disabled:opacity-50'),
    (r'px-6 py-2 bg-\[\#FF0032\] border border-\[\#FF0032\] text-white rounded-none text-\[10px\] font-black uppercase tracking-\[0\.3em\] hover:bg-\[\#FF0032\]/80 transition-all flex items-center gap-2 shadow-\[0_0_20px_rgba\(255,0,50,0\.3\)\] disabled:opacity-50 italic', 'px-4 py-2 bg-[#FF0032] text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50'),
    (r'px-6 py-2 bg-white/5 border border-white/10 text-white/50 rounded-none text-\[10px\] font-black uppercase tracking-\[0\.3em\] hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 italic', 'px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl font-medium text-sm hover:text-white hover:bg-white/10 transition-all flex items-center gap-2'),
    (r'px-6 py-2 bg-\[\#FF0032\] text-white rounded-none text-\[10px\] font-black uppercase tracking-\[\.2em\] hover-glitch transition-all shadow-\[0_0_15px_rgba\(255,0,50,0\.3\)\] disabled:opacity-50', 'px-5 py-2 bg-[#FF0032] text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50'),

    # Glitch / Shapes
    (r'hover-glitch', ''),
    (r' rounded-none', ' rounded-xl')
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

print(f"Updated shapes in {total_files} files.")
