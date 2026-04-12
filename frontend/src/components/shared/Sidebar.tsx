import { NavLink } from "react-router-dom";
import { useAppStore } from "../../lib/store";

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

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#0A0A0C] border-r border-white/5 flex flex-col p-6 gap-2 z-50 shadow-2xl">
      {/* Brand Logo */}
      <div className="px-2 py-4 mb-10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 rounded-none bg-[#FF0032] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,50,0.3)] hover-glitch transition-all">
            <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-white font-black italic tracking-tighter leading-none uppercase">AdSage</h2>
            <p className="font-sans tracking-[0.4em] uppercase text-[8px] text-[#00F0FF] font-bold">The Verse</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {items.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-200 group relative ${
                isActive 
                  ? "text-[#00F0FF] bg-white/5" 
                  : "text-white/40 hover:text-white hover:bg-white/5 hover-glitch"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 w-1 h-full bg-[#FF0032] shadow-[0_0_10px_#FF0032]" />}
                <span className={`material-symbols-outlined text-[22px] ${isActive ? "text-[#FF0032]" : ""}`}>{icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-white' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>


      {/* User Context */}
      <div className="mt-4 pt-6 border-t border-white/5 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#121214] flex items-center justify-center border border-white/10 group hover:border-[#FF0032]/50 transition-colors">
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
