import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
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
    <div className="bg-[#050505] p-4 rounded-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] font-sans text-xs">
      <p className="font-black italic uppercase tracking-widest text-white/40 mb-2 border-b border-white/5 pb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 py-1" style={{ color: p.color }}>
          <span className="opacity-80 font-bold uppercase tracking-wider">{p.name}:</span>
          <span className="font-black text-white italic tracking-tighter">{p.dataKey === "roas" ? `${p.value}x` : formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function PerformanceTrends({ data, title = "Performance Trend" }: Props) {
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
    <div className="bg-[#0A0A0C] p-8 rounded-2xl border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden h-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h4 className="font-serif text-3xl font-black text-white italic tracking-tighter uppercase mb-1">{title}</h4>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] italic">Revenue vs Expenditure over 30 days</p>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] italic">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.5)]"></div>
            <span className="text-white/60">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF0032] shadow-[0_0_8px_rgba(255,0,50,0.5)]"></div>
            <span className="text-white/60">Expenditure</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)", fontWeight: 900 }}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)", fontWeight: 900 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#00F0FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRev)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#00F0FF", style: { filter: "drop-shadow(0 0 8px rgba(0,240,255,0.5))" } }}
            />
            <Line
                type="monotone"
                dataKey="spend"
                name="Expenditure"
                stroke="#FF0032"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#FF0032", style: { filter: "drop-shadow(0 0 8px rgba(255,0,50,0.5))" } }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between px-2 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">
        <span>WK 01</span>
        <span>WK 02</span>
        <span>WK 03</span>
        <span>WK 04</span>
      </div>
    </div>
  );
}
