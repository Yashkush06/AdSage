import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { DailyTrendRow } from "../../types";
import { formatCurrency } from "../../lib/utils";

interface Props {
  data: DailyTrendRow[];
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-dim)",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        fontSize: "0.8rem",
      }}
    >
      <p style={{ margin: "0 0 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, margin: "0.2rem 0" }}>
          {p.name}: <strong>{p.dataKey === "roas" ? `${p.value}x` : formatCurrency(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

export function PerformanceTrends({ data, title = "30-Day Performance Trends" }: Props) {
  // Aggregate by date if multiple campaigns
  const byDate: Record<string, { spend: number; revenue: number; roas_sum: number; count: number }> = {};
  data.forEach((row) => {
    if (!byDate[row.date]) byDate[row.date] = { spend: 0, revenue: 0, roas_sum: 0, count: 0 };
    byDate[row.date].spend    += row.spend;
    byDate[row.date].revenue  += row.revenue;
    byDate[row.date].roas_sum += row.roas;
    byDate[row.date].count    += 1;
  });

  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, agg]) => ({
      date: date.slice(5),  // MM-DD
      spend:   Math.round(agg.spend),
      revenue: Math.round(agg.revenue),
      roas:    Math.round((agg.roas_sum / agg.count) * 100) / 100,
    }));

  return (
    <div className="glass-card" style={{ padding: "1.25rem" }}>
      <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${Math.round(v / 1000)}K`}
            yAxisId="left"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}x`}
            domain={[0, 7]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="spend"
            name="Spend"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#10b981" }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="roas"
            name="ROAS"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
