import { useQuery } from "@tanstack/react-query";
import { campaignsApi, analyticsApi } from "../lib/api";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { FunnelVisualization } from "../components/analytics/FunnelVisualization";
import { AudienceInsights } from "../components/analytics/AudienceInsights";
import { PageLoader } from "../components/shared/LoadingStates";
import { useState } from "react";
import type { Campaign } from "../types";
import { BarChart2 } from "lucide-react";

export function Analytics() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  const { data: campaignsRes } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsApi.list("ACTIVE"),
  });

  const campaigns: Campaign[] = campaignsRes?.data?.campaigns || [];
  const cid = selectedCampaign || campaigns[0]?.id || "";

  const { data: trendRes, isLoading: loadingTrends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => analyticsApi.trends(30),
  });

  const { data: funnelRes } = useQuery({
    queryKey: ["funnel", cid],
    queryFn: () => campaignsApi.funnel(cid),
    enabled: Boolean(cid),
  });

  const { data: audienceRes } = useQuery({
    queryKey: ["audience", cid],
    queryFn: () => campaignsApi.audience(cid),
    enabled: Boolean(cid),
  });

  const { data: insightsRes } = useQuery({
    queryKey: ["insights"],
    queryFn: () => analyticsApi.insights(),
    staleTime: 5 * 60 * 1000,
  });

  if (loadingTrends) return <PageLoader />;

  const trends   = trendRes?.data?.trends || [];
  const funnel   = funnelRes?.data?.funnel?.funnel_steps || [];
  const audience = audienceRes?.data?.breakdown?.audience_segments || [];
  const insights = insightsRes?.data?.insights;

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Analytics</h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Deep performance data across all campaigns
        </p>
      </div>

      {/* AI Insights banner */}
      {insights && (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <BarChart2 size={16} color="#818cf8" />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#818cf8" }}>AI Weekly Insight</span>
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Rating: <strong style={{ color: insights.week_rating >= 7 ? "#10b981" : insights.week_rating >= 4 ? "#f59e0b" : "#ef4444" }}>
                {insights.week_rating}/10
              </strong>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)" }}>
            {insights.headline}
          </p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "0.875rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", fontWeight: 600, color: "#10b981" }}>KEY WINS</p>
              {insights.key_wins.map((w: string, i: number) => (
                <p key={i} style={{ margin: "0.125rem 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>✓ {w}</p>
              ))}
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", fontWeight: 600, color: "#ef4444" }}>CONCERNS</p>
              {insights.key_concerns.map((c: string, i: number) => (
                <p key={i} style={{ margin: "0.125rem 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>⚠ {c}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <PerformanceTrends data={trends} title="All Campaigns — 30-Day Trend" />

      {/* Campaign selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)" }}>
          Campaign breakdown:
        </span>
        <select
          id="campaign-select"
          value={cid}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="input"
          style={{ maxWidth: 300 }}
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        {funnel.length > 0 && <FunnelVisualization steps={funnel} />}
        {audience.length > 0 && <AudienceInsights segments={audience} />}
      </div>
    </div>
  );
}
