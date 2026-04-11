import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { useState } from "react";

interface HourlyBucket {
  hour: number;
  conversions: number;
  spend: number;
  revenue: number;
  cpa: number;
}

interface Props {
  data?: HourlyBucket[];
}

// Generate realistic hourly data with morning + evening peaks
function generateFallback(): HourlyBucket[] {
  const pattern = [
    2, 1, 1, 1, 2, 4, 8, 14, 22, 28, 32, 30,
    26, 24, 28, 34, 42, 52, 60, 56, 46, 34, 22, 10,
  ];
  return pattern.map((conv, h) => {
    const spend = conv * 38 + Math.random() * 400;
    const revenue = spend * (3.2 + Math.random() * 1.5);
    return {
      hour: h,
      conversions: conv + Math.round(Math.random() * 4),
      spend: Math.round(spend),
      revenue: Math.round(revenue),
      cpa: Math.round(spend / Math.max(conv, 1)),
    };
  });
}

const FALLBACK_DATA = generateFallback();

const HOUR_LABEL = (h: number) => {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
};

const SESSION_LABELS: Record<string, { hours: number[]; label: string; color: string; icon: string }> = {
  night:   { hours: [0,1,2,3,4,5],       label: "Night",     color: "#6366f1", icon: "nights_stay" },
  morning: { hours: [6,7,8,9,10,11],     label: "Morning",   color: "#f59e0b", icon: "wb_sunny" },
  midday:  { hours: [12,13,14,15,16,17], label: "Midday",    color: "#10b981", icon: "light_mode" },
  evening: { hours: [18,19,20,21,22,23], label: "Evening",   color: "#566252", icon: "nights_stay" },
};

function getSession(hour: number): string {
  for (const [key, s] of Object.entries(SESSION_LABELS)) {
    if (s.hours.includes(hour)) return key;
  }
  return "midday";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: HourlyBucket = payload[0]?.payload;
  const session = getSession(d.hour);
  const s = SESSION_LABELS[session];
  return (
    <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 shadow-xl font-body text-xs min-w-[170px]">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/10">
        <span className="material-symbols-outlined text-base" style={{ color: s.color }}>{s.icon}</span>
        <span className="font-bold text-on-surface text-sm">{HOUR_LABEL(d.hour)}</span>
        <span className="ml-auto text-[10px] uppercase font-bold tracking-widest" style={{ color: s.color }}>{s.label}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-stone-400 font-medium">Conversions</span>
          <span className="font-bold text-on-surface">{d.conversions}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-stone-400 font-medium">Spend</span>
          <span className="font-bold text-on-surface">₹{d.spend.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-stone-400 font-medium">Revenue</span>
          <span className="font-bold text-primary">₹{d.revenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-stone-400 font-medium">CPA</span>
          <span className="font-bold text-on-surface">₹{d.cpa}</span>
        </div>
      </div>
    </div>
  );
};

type ViewMode = "conversions" | "spend" | "cpa";

const VIEW_OPTIONS: { key: ViewMode; label: string; icon: string }[] = [
  { key: "conversions", label: "Conversions", icon: "shopping_cart" },
  { key: "spend",       label: "Spend",       icon: "paid" },
  { key: "cpa",        label: "CPA",         icon: "analytics" },
];

export function PeakConversions({ data = FALLBACK_DATA }: Props) {
  const [view, setView] = useState<ViewMode>("conversions");

  const maxVal = Math.max(...data.map((d) => d[view]), 1);
  const peakHour = data.reduce((best, curr) =>
    curr[view] > best[view] ? curr : best, data[0]);

  // Session summary
  const sessionTotals = Object.entries(SESSION_LABELS).map(([key, s]) => {
    const buckets = data.filter((d) => s.hours.includes(d.hour));
    return {
      key, ...s,
      totalConv: buckets.reduce((sum, b) => sum + b.conversions, 0),
      totalSpend: buckets.reduce((sum, b) => sum + b.spend, 0),
      avgCpa: Math.round(
        buckets.reduce((sum, b) => sum + b.spend, 0) / Math.max(buckets.reduce((sum, b) => sum + b.conversions, 0), 1)
      ),
    };
  }).sort((a, b) => b.totalConv - a.totalConv);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-outline-variant/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Time Intelligence</span>
            </div>
            <h4 className="font-serif text-2xl font-bold text-on-surface">Peak Conversions</h4>
            <p className="text-stone-400 text-xs mt-0.5">Hourly breakdown of conversion activity</p>
          </div>

          {/* Peak callout */}
          <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border border-primary/20 rounded-xl">
            <span className="material-symbols-outlined text-primary text-xl">bolt</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Peak Hour</p>
              <p className="text-lg font-serif font-bold text-primary">{HOUR_LABEL(peakHour.hour)}</p>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 mt-5 p-1 bg-surface-container-high rounded-lg w-fit">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === opt.key
                  ? "bg-white text-primary shadow-sm border border-outline-variant/20"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-8 pt-6">
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="20%">
              <CartesianGrid stroke="#e5e2dd" vertical={false} strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => (h % 6 === 0 ? HOUR_LABEL(h) : "")}
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  view === "spend" || view === "cpa"
                    ? `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f6f3ee" }} />
              <ReferenceLine
                y={maxVal * 0.7}
                stroke="#566252"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Bar dataKey={view} radius={[3, 3, 0, 0]} maxBarSize={28}>
                {data.map((entry) => {
                  const session = getSession(entry.hour);
                  const isPeak = entry[view] === maxVal;
                  const sessionColor = SESSION_LABELS[session].color;
                  return (
                    <Cell
                      key={entry.hour}
                      fill={isPeak ? "#566252" : sessionColor}
                      fillOpacity={isPeak ? 1 : 0.55}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time-of-day legend */}
        <div className="flex justify-between mt-2 mb-6 px-1">
          {Object.entries(SESSION_LABELS).map(([key, s]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-outline-variant/10 border-t border-outline-variant/10">
        {sessionTotals.map((s, idx) => (
          <div key={s.key} className={`p-5 bg-surface-container-lowest ${idx === 0 ? "relative" : ""}`}>
            {idx === 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[10px]">star</span>
                Best
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-base" style={{ color: s.color }}>{s.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
            </div>
            <p className="text-2xl font-serif font-bold text-on-surface">{s.totalConv}</p>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Conversions</p>
            <p className="text-xs font-bold text-stone-500 mt-2">₹{s.avgCpa} avg. CPA</p>
          </div>
        ))}
      </div>
    </div>
  );
}
