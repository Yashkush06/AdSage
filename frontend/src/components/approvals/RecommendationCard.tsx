import { CheckCircle, XCircle, AlertTriangle, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Recommendation } from "../../types";
import { formatCurrency, timeAgo, priorityColor, riskColor } from "../../lib/utils";

interface Props {
  rec: Recommendation;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  PAUSE_CAMPAIGN:    "Pause Campaign",
  BUDGET_INCREASE:   "Increase Budget",
  BUDGET_DECREASE:   "Reduce Budget",
  SCALE_CAMPAIGN:    "Scale Campaign",
  DUPLICATE_CAMPAIGN:"Duplicate Campaign",
  AUDIENCE_EXPANSION:"Audience Expansion",
  CREATIVE_REFRESH:  "Creative Refresh",
};

const AGENT_COLORS: Record<string, string> = {
  "Performance Detective": "#6366f1",
  "Budget Strategist":     "#10b981",
  "Growth Executor":       "#f59e0b",
};

export function RecommendationCard({ rec, onApprove, onReject, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card animate-slide-up"
      style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.5rem" }}>
            <span className={`badge ${priorityColor(rec.priority)}`}>{rec.priority.toUpperCase()}</span>
            <span className={`badge ${riskColor(rec.risk_level)}`}>Risk: {rec.risk_level}</span>
            <span className="badge badge-gray">{TYPE_LABELS[rec.type] || rec.type}</span>
          </div>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
            {rec.title}
          </h3>
        </div>
        {/* Confidence ring */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: `conic-gradient(#6366f1 ${rec.confidence_score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--bg-card)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700, color: "var(--text-primary)",
              }}
            >
              {rec.confidence_score}%
            </div>
          </div>
        </div>
      </div>

      {/* Agent + time */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            fontSize: "0.75rem", fontWeight: 600,
            color: AGENT_COLORS[rec.agent_name] || "#64748b",
          }}
        >
          {rec.agent_name}
        </span>
        <span style={{ color: "var(--text-faint)", fontSize: "0.75rem" }}>•</span>
        <Clock size={11} color="var(--text-faint)" />
        <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{timeAgo(rec.created_at)}</span>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        {rec.description}
      </p>

      {/* Expandable details */}
      <button
        className="btn-ghost"
        onClick={() => setExpanded(!expanded)}
        style={{ fontSize: "0.8rem", padding: "0.375rem 0.75rem", alignSelf: "flex-start" }}
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? "Less detail" : "More detail"}
      </button>

      {expanded && (
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            borderRadius: 10,
            padding: "0.875rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {rec.reasoning && (
            <div>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                Reasoning
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>{rec.reasoning}</p>
            </div>
          )}
          {Object.keys(rec.predicted_impact).length > 0 && (
            <div>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                Predicted Impact
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {Object.entries(rec.predicted_impact).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: 8,
                      padding: "0.375rem 0.625rem",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#818cf8" }}>
                      {k.replace(/_/g, " ")}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: 600 }}>
                      {String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.625rem" }}>
        <button
          id={`approve-btn-${rec.id}`}
          className="btn-primary"
          onClick={() => onApprove(rec.id)}
          disabled={isLoading}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <CheckCircle size={14} />
          Approve & Execute
        </button>
        <button
          id={`reject-btn-${rec.id}`}
          className="btn-danger"
          onClick={() => onReject(rec.id)}
          disabled={isLoading}
        >
          <XCircle size={14} />
          Reject
        </button>
      </div>
    </div>
  );
}
