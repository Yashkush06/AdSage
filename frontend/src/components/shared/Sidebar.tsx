import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, CheckSquare, BarChart2,
  Megaphone, Settings, Zap,
} from "lucide-react";
import { useAppStore } from "../../lib/store";

const items = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/approvals", icon: CheckSquare,     label: "Approvals"  },
  { to: "/analytics", icon: BarChart2,       label: "Analytics"  },
  { to: "/campaigns", icon: Megaphone,       label: "Campaigns"  },
  { to: "/settings",  icon: Settings,        label: "Settings"   },
];

export function Sidebar() {
  const { user } = useAppStore();

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-dim)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem",
        gap: "0.5rem",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Zap size={16} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              AdSage
            </p>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>
              Meta Ads Agent
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div
        style={{
          borderTop: "1px solid var(--border-dim)",
          paddingTop: "1rem",
        }}
      >
        <div style={{ paddingLeft: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {user?.business_name || "Demo Store"}
          </p>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {user?.industry || "E-commerce"} · Demo Mode
          </p>
        </div>
      </div>
    </aside>
  );
}
