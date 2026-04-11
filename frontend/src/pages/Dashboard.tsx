import { useQuery } from "@tanstack/react-query";
import { analyticsApi, campaignsApi } from "../lib/api";
import { MetricsCards } from "../components/dashboard/MetricsCards";
import { AgentActivityFeed } from "../components/dashboard/AgentActivityFeed";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { PageLoader } from "../components/shared/LoadingStates";
import { Play, RefreshCw, Zap } from "lucide-react";
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
          { name: "Performance Detective", role: "Identifies underperformers", color: "#6366f1" },
          { name: "Budget Strategist",     role: "Optimizes budget allocation", color: "#10b981" },
          { name: "Growth Executor",       role: "Scales winning campaigns",   color: "#f59e0b" },
        ].map((agent) => (
          <div key={agent.name} className="glass-card" style={{ padding: "1.125rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="agent-dot idle" />
              <Zap size={13} color={agent.color} />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {agent.name}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>{agent.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
