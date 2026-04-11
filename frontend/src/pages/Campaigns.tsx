import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "../lib/api";
import { PageLoader } from "../components/shared/LoadingStates";
import { useState } from "react";
import type { Campaign, CampaignInsights } from "../types";
import { formatCurrency, formatNumber, formatRoas, trendIcon } from "../lib/utils";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

function TrendBadge({ trend }: { trend: string }) {
  const color = trend === "improving" ? "#10b981" : trend === "declining" ? "#ef4444" : "#64748b";
  const icon  = trend === "improving" ? <TrendingUp size={11} /> : trend === "declining" ? <TrendingDown size={11} /> : <Minus size={11} />;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color, fontSize: "0.75rem", fontWeight: 600 }}>
      {icon}{trend}
    </span>
  );
}

function CampaignRow({ campaign, onSelect, selected }: {
  campaign: Campaign;
  onSelect: (c: Campaign) => void;
  selected: boolean;
}) {
  const { data: insRes } = useQuery({
    queryKey: ["insights", campaign.id],
    queryFn: () => campaignsApi.insights(campaign.id, 30),
  });
  const ins: CampaignInsights | undefined = insRes?.data?.insights;

  return (
    <tr
      onClick={() => onSelect(campaign)}
      style={{
        cursor: "pointer",
        background: selected ? "rgba(99,102,241,0.08)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      <td style={{ padding: "0.875rem 1rem" }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{campaign.name}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>{campaign.objective}</p>
      </td>
      <td style={{ padding: "0.875rem 1rem", textAlign: "center" }}>
        <span className={`badge ${campaign.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
          {campaign.status}
        </span>
      </td>
      <td style={{ padding: "0.875rem 1rem", textAlign: "right", color: "var(--text-primary)", fontSize: "0.875rem" }}>
        {ins ? formatCurrency(ins.spend) : "—"}
      </td>
      <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontSize: "0.875rem" }}>
        {ins ? (
          <span style={{ color: ins.roas >= 3 ? "#10b981" : ins.roas >= 1 ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>
            {formatRoas(ins.roas)}
          </span>
        ) : "—"}
      </td>
      <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        {ins ? formatCurrency(ins.cpa) : "—"}
      </td>
      <td style={{ padding: "0.875rem 1rem", textAlign: "right", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        {ins ? formatNumber(ins.conversions) : "—"}
      </td>
      <td style={{ padding: "0.875rem 1rem" }}>
        {ins ? <TrendBadge trend={ins.trend} /> : "—"}
      </td>
    </tr>
  );
}

export function Campaigns() {
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["campaigns", statusFilter],
    queryFn: () => campaignsApi.list(statusFilter),
  });

  const campaigns: Campaign[] = data?.data?.campaigns || [];

  if (isLoading) return <PageLoader />;

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Campaigns</h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {campaigns.length} campaigns · demo data
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
          <button className="btn-ghost" onClick={() => refetch()}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-dim)" }}>
                {["Campaign", "Status", "Spend (30d)", "ROAS", "CPA", "Conversions", "Trend"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: h === "Campaign" || h === "Status" || h === "Trend" ? "left" : "right",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <CampaignRow
                  key={c.id}
                  campaign={c}
                  onSelect={setSelected}
                  selected={selected?.id === c.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
