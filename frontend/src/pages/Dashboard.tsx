import { useQuery } from "@tanstack/react-query";
import { analyticsApi, campaignsApi } from "../lib/api";
import { MetricsCards } from "../components/dashboard/MetricsCards";
import { AgentActivityFeed } from "../components/dashboard/AgentActivityFeed";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { PageLoader } from "../components/shared/LoadingStates";
import { Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { analyticsApi as api } from "../lib/api";

export function Dashboard() {
  const [cycling, setCycling] = useState(false);
  const [cycleMsg, setCycleMsg] = useState("");

  const { data: overviewRes, isLoading: loadingOverview, refetch: refetchOverview } =
    useQuery({ queryKey: ["overview"], queryFn: () => analyticsApi.overview(), refetchInterval: 30000 });

  const { data: trendsRes, isLoading: loadingTrends } =
    useQuery({ queryKey: ["trends"], queryFn: () => analyticsApi.trends(30) });

  const { data: activityRes, isLoading: loadingActivity, refetch: refetchActivity } =
    useQuery({ queryKey: ["activity"], queryFn: () => analyticsApi.agentActivity(40), refetchInterval: 15000 });

  const overview   = overviewRes?.data?.overview;
  const trends     = trendsRes?.data?.trends || [];
  const activity   = activityRes?.data?.activity || [];

  async function runCycle() {
    setCycling(true);
    setCycleMsg("Running agent cycle…");
    try {
      const res = await api.runCycle();
      const total = res.data?.result?.total_recommendations || 0;
      setCycleMsg(`✓ Cycle complete — ${total} new recommendations`);
      refetchOverview();
      refetchActivity();
    } catch {
      setCycleMsg("Cycle failed — check backend");
    } finally {
      setCycling(false);
      setTimeout(() => setCycleMsg(""), 6000);
    }
  }

  if (loadingOverview && !overview) return <PageLoader />;

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
            Campaign Dashboard
          </h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Real-time overview powered by AI agents
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {cycleMsg && (
            <span style={{ fontSize: "0.8rem", color: "#10b981", padding: "0.375rem 0.75rem", background: "rgba(16,185,129,0.1)", borderRadius: 8 }}>
              {cycleMsg}
            </span>
          )}
          <button className="btn-primary" onClick={runCycle} disabled={cycling} id="run-cycle-btn">
            {cycling ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {cycling ? "Running…" : "Run Agent Cycle"}
          </button>
        </div>
      </div>

      {/* Metrics */}
      {overview && <MetricsCards metrics={overview} />}

      {/* Charts + Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }}>
        <PerformanceTrends data={trends} />
        <AgentActivityFeed activity={activity} isLoading={loadingActivity} />
      </div>

      {/* Agent status cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
        {[
          { name: "Performance Detective", role: "Identifies underperformers", color: "#6366f1", emoji: "🔍" },
          { name: "Budget Strategist",     role: "Optimizes budget allocation", color: "#10b981", emoji: "💰" },
          { name: "Growth Executor",       role: "Scales winning campaigns",   color: "#f59e0b", emoji: "🚀" },
        ].map((agent) => {
          // Find the latest activity log entries for this agent
          const agentLogs = activity.filter(
            (a: any) => a.agent_name?.toLowerCase().includes(agent.name.split(" ")[0].toLowerCase())
          );
          const latest = agentLogs[0];
          const isError = latest?.level === "error";
          const isActive = latest && new Date(latest.created_at).getTime() > Date.now() - 10 * 60 * 1000;

          // Relative time
          const timeAgo = latest
            ? (() => {
                const diff = Math.round((Date.now() - new Date(latest.created_at).getTime()) / 1000);
                if (diff < 60) return "just now";
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                return `${Math.floor(diff / 86400)}d ago`;
              })()
            : null;

          // Count how many logs are info vs error
          const successCount = agentLogs.filter((a: any) => a.level === "info").length;
          const errorCount = agentLogs.filter((a: any) => a.level === "error").length;

          return (
            <div key={agent.name} className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: isError ? "#ef4444" : isActive ? "#10b981" : "rgba(255,255,255,0.2)",
                    boxShadow: isActive ? `0 0 6px ${isError ? "#ef444488" : "#10b98188"}` : "none",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "1rem" }}>{agent.emoji}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {agent.name}
                </span>
                {timeAgo && (
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-faint)" }}>
                    {timeAgo}
                  </span>
                )}
              </div>

              {/* Role */}
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>{agent.role}</p>

              {/* Latest action */}
              {latest ? (
                <div
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: isError ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.06)",
                    borderRadius: 8,
                    borderLeft: `3px solid ${isError ? "#ef4444" : agent.color}`,
                  }}
                >
                  <p style={{
                    margin: 0, fontSize: "0.75rem", lineHeight: 1.5,
                    color: isError ? "#fca5a5" : "var(--text-muted)",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>
                    {latest.message}
                  </p>
                </div>
              ) : (
                <div style={{ padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-faint)", fontStyle: "italic" }}>
                    No activity yet — run an agent cycle
                  </p>
                </div>
              )}

              {/* Stats row */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "#10b981" }}>●</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{successCount} runs</span>
                </div>
                {errorCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "#ef4444" }}>●</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{errorCount} errors</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
