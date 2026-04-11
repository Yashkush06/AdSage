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
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#f6f3ee] flex flex-col p-4 gap-2 z-50">
      {/* Brand Logo */}
      <div className="px-2 py-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              temp_preferences_eco
            </span>
          </div>
          <div>
            <h2 className="font-serif text-lg text-primary font-bold leading-tight">AdSage AI</h2>
            <p className="font-sans tracking-wide uppercase text-[10px] text-stone-500">The Observatory</p>
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
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? "bg-[#e5e2dd] text-primary" 
                  : "text-stone-500 hover:text-primary hover:bg-[#e5e2dd]/50"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className={`font-sans tracking-wide uppercase text-[11px] ${to === window.location.pathname ? 'font-semibold' : ''}`}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* New Campaign Button */}
      <div className="mt-auto p-2">
        <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest">New Campaign</span>
        </button>
      </div>

      {/* User Context */}
      <div className="mt-4 pt-4 border-t border-outline-variant/20 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border border-outline-variant/20">
            <span className="text-white text-[10px] font-bold">
              {(user?.business_name || "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold text-on-surface truncate">
              {user?.business_name || "Evelyn Harper"}
            </p>
            <p className="text-[9px] uppercase tracking-widest text-stone-400 truncate">
              {user?.industry || "Architect"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
