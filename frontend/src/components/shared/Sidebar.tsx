import { NavLink } from "react-router-dom";
import { useAppStore } from "../../lib/store";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const items = [
  { to: "/",          icon: "dashboard", label: "Dashboard" },
  { to: "/campaigns", icon: "campaign",  label: "Campaigns" },
  { to: "/creative-studio", icon: "draw", label: "Creative Studio" },
  { to: "/analytics", icon: "analytics", label: "Analytics" },
  { to: "/approvals", icon: "fact_check", label: "Approvals" },
  { to: "/settings",  icon: "settings",   label: "Settings" },
];

export function Sidebar() {
  const { user } = useAppStore();
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const ease = 'power3.easeOut';

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 1.0, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 1.0, ease, overwrite: 'auto' }, 0);
        }

        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 1.0, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    setTimeout(layout, 100);

    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2, // slightly faster exit
      ease,
      overwrite: 'auto'
    });
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#0A0A0C] border-r border-white/5 flex flex-col p-6 gap-2 z-50 shadow-2xl">
      {/* Brand Logo */}
      <div className="px-2 py-4 mb-10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-[#FF0032] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,50,0.3)] group-hover:rotate-[360deg] transition-all duration-[800ms] ease-out">
            <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-white font-black italic tracking-tighter leading-none uppercase">AdSage</h2>
            <p className="font-sans tracking-[0.4em] uppercase text-[8px] text-[#00F0FF] font-bold">Ad Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {items.map(({ to, icon, label }, i) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={() => handleLeave(i)}
            className={({ isActive }) => 
              `flex items-center w-full px-4 py-3 rounded-xl transition-colors duration-200 group relative overflow-hidden ${
                isActive 
                  ? "bg-white/10" 
                  : "bg-transparent border border-transparent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="absolute left-1/2 bottom-0 rounded-full bg-[#FF0032] z-0 block pointer-events-none"
                  aria-hidden="true"
                  ref={(el) => {
                    circleRefs.current[i] = el;
                  }}
                />
                {isActive && <div className="absolute left-0 w-1 h-full top-0 bg-[#FF0032] shadow-[0_0_10px_#FF0032] z-20" />}
                
                <div className="relative z-10 w-full flex items-center h-[24px]">
                  {/* Default Label */}
                  <div className="pill-label flex items-center gap-4 absolute w-full inset-y-0 left-0">
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#FF0032] drop-shadow-[0_0_5px_rgba(255,0,50,0.5)]" : "text-white/60"}`}>{icon}</span>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-[#00F0FF]' : 'text-white/60'}`}>
                      {label}
                    </span>
                  </div>
                  {/* Hover Label */}
                  <div className="pill-label-hover flex items-center gap-4 absolute w-full inset-y-0 left-0 text-white z-10 opacity-0 transform translate-y-full">
                     <span className="material-symbols-outlined text-[20px] text-white drop-shadow-md">{icon}</span>
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md">
                       {label}
                     </span>
                  </div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Context */}
      <div className="mt-4 pt-6 border-t border-white/5 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#121214] flex items-center justify-center border border-white/10 group hover:border-[#FF0032]/50 transition-colors">
            <span className="text-white text-xs font-black italic">
              {(user?.business_name || "M").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-white italic truncate uppercase">
              {user?.business_name || "Miles Morales"}
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#00F0FF] font-bold truncate">
              {user?.industry || "Vigilante"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
