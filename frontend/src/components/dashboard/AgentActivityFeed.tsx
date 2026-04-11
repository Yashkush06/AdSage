import { useEffect, useRef, useState } from "react";
import { Cpu, AlertTriangle, Info } from "lucide-react";
import type { AgentActivity } from "../../types";
import { timeAgo } from "../../lib/utils";

interface Props {
  activity: AgentActivity[];
  isLoading?: boolean;
}

const AGENT_COLORS: Record<string, string> = {
  "Performance Detective": "#6366f1",
  "Budget Strategist":     "#10b981",
  "Growth Executor":       "#f59e0b",
  "System":                "#64748b",
};

function ActivityIcon({ level }: { level: string }) {
  if (level === "error")   return <AlertTriangle size={13} color="#ef4444" />;
  if (level === "warning") return <AlertTriangle size={13} color="#f59e0b" />;
  return <Info size={13} color="#6366f1" />;
}

export function AgentActivityFeed({ activity, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activity]);

  return (
    <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Cpu size={16} color="var(--accent-blue)" />
        <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
          Agent Activity
        </h3>
        {isLoading && <span className="badge badge-blue" style={{ marginLeft: "auto" }}>Live</span>}
      </div>

      <div
        style={{
          maxHeight: 320,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {activity.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "2rem 0" }}>
            No agent activity yet. Run a cycle to start.
          </p>
        ) : (
          activity.map((log) => (
            <div
              key={log.id}
              className="animate-fade-in"
              style={{
                display: "flex",
                gap: "0.625rem",
                padding: "0.5rem 0.625rem",
                borderRadius: 8,
                background: "rgba(255,255,255,0.025)",
                alignItems: "flex-start",
              }}
            >
              <div style={{ paddingTop: 2 }}>
                <ActivityIcon level={log.level} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: AGENT_COLORS[log.agent_name] || "#64748b",
                    }}
                  >
                    {log.agent_name}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>
                    {timeAgo(log.created_at)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {log.message}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
