import type { FunnelStep } from "../../types";
import { formatNumber } from "../../lib/utils";

interface Props {
  steps: FunnelStep[];
}

const STEP_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#10b981"];

export function FunnelVisualization({ steps }: Props) {
  const maxCount = steps[0]?.count || 1;

  return (
    <div className="glass-card" style={{ padding: "1.25rem" }}>
      <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
        Conversion Funnel
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {steps.map((step, i) => {
          const pct = (step.count / maxCount) * 100;
          return (
            <div key={step.step}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>{step.label}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {formatNumber(step.count)}
                  {step.drop_rate > 0 && (
                    <span style={{ marginLeft: "0.5rem", color: "#ef4444", fontWeight: 400, fontSize: "0.75rem" }}>
                      −{step.drop_rate}%
                    </span>
                  )}
                </span>
              </div>
              <div
                style={{
                  height: 8, background: "rgba(255,255,255,0.06)",
                  borderRadius: 4, overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%", width: `${pct}%`,
                    background: STEP_COLORS[i],
                    borderRadius: 4,
                    transition: "width 0.6s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {steps.length > 1 && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(99,102,241,0.08)", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#818cf8" }}>
            Overall conversion rate:{" "}
            <strong>
              {steps[0]?.count > 0
                ? `${((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(1)}%`
                : "N/A"}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
