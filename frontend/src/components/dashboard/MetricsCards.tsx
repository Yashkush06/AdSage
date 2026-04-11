import { TrendingUp, TrendingDown, Minus, DollarSign, Users, Target, Activity } from "lucide-react";
import type { OverviewMetrics } from "../../types";
import { formatCurrency, formatNumber, formatRoas } from "../../lib/utils";

interface Props {
  metrics: OverviewMetrics;
}

interface CardDef {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  positive?: boolean;
}

export function MetricsCards({ metrics }: Props) {
  const cards: CardDef[] = [
    {
      label: "Total Spend",
      value: formatCurrency(metrics.total_spend),
      sub: `${metrics.period_days}-day period`,
      icon: <DollarSign size={18} />,
      color: "#6366f1",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(metrics.total_revenue),
      sub: `${formatRoas(metrics.avg_roas)} average ROAS`,
      icon: <TrendingUp size={18} />,
      color: "#10b981",
      positive: true,
    },
    {
      label: "Conversions",
      value: formatNumber(metrics.total_conversions),
      sub: `Avg CPA ${formatCurrency(metrics.avg_cpa)}`,
      icon: <Target size={18} />,
      color: "#8b5cf6",
    },
    {
      label: "Active Campaigns",
      value: String(metrics.active_campaigns),
      sub: `${metrics.paused_campaigns} paused`,
      icon: <Activity size={18} />,
      color: "#f59e0b",
    },
    {
      label: "Avg CTR",
      value: `${metrics.avg_ctr.toFixed(2)}%`,
      sub: `${formatNumber(metrics.total_clicks)} total clicks`,
      icon: <Users size={18} />,
      color: "#64748b",
    },
    {
      label: "Impressions",
      value: formatNumber(metrics.total_impressions),
      sub: "Total ad views",
      icon: <Minus size={18} />,
      color: "#475569",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "1rem",
      }}
    >
      {cards.map((card) => (
        <div key={card.label} className="stat-card animate-slide-up">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {card.label}
            </span>
            <span style={{ color: card.color, opacity: 0.8 }}>{card.icon}</span>
          </div>
          <p style={{ margin: 0, fontSize: "1.625rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {card.value}
          </p>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
