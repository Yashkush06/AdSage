import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { AudienceSegment } from "../../types";

interface Props {
  segments: AudienceSegment[];
}

const GENDER_COLORS = { male: "#6366f1", female: "#a78bfa" };

export function AudienceInsights({ segments }: Props) {
  // Group by age
  const byAge: Record<string, { male_roas: number; female_roas: number }> = {};
  segments.forEach((s) => {
    if (!byAge[s.age]) byAge[s.age] = { male_roas: 0, female_roas: 0 };
    if (s.gender === "male")   byAge[s.age].male_roas   = s.roas;
    if (s.gender === "female") byAge[s.age].female_roas = s.roas;
  });

  const chartData = Object.entries(byAge).map(([age, vals]) => ({
    age,
    "Male ROAS":   vals.male_roas,
    "Female ROAS": vals.female_roas,
  }));

  return (
    <div className="glass-card" style={{ padding: "1.25rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
        Audience Performance by Age/Gender
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="age" tick={{ fontSize: 11, fill: "var(--text-faint)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}x`} />
          <Tooltip
            contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: 8, fontSize: "0.8rem" }}
            formatter={(v: number) => [`${v.toFixed(2)}x ROAS`]}
          />
          <Bar dataKey="Male ROAS"   fill="#6366f1" radius={[4,4,0,0]} />
          <Bar dataKey="Female ROAS" fill="#a78bfa" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Top performers */}
      <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
          Top Segments
        </p>
        {[...segments]
          .sort((a, b) => b.roas - a.roas)
          .slice(0, 3)
          .map((s) => (
            <div
              key={`${s.age}-${s.gender}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.375rem 0.5rem", borderRadius: 6,
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                {s.age} · {s.gender}
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#10b981" }}>
                {s.roas.toFixed(2)}x ROAS
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
