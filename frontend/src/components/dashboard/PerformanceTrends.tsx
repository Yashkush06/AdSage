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
    <div className="bg-[#181A2F] p-4 rounded-xl border border-[#37415C] shadow-2xl font-body text-xs">
      <p className="font-bold text-white mb-2 border-b border-[#37415C]/10 pb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 py-0.5" style={{ color: p.color }}>
          <span className="opacity-80 font-medium">{p.name}:</span>
          <span className="font-bold">{p.dataKey === "roas" ? `${p.value}x` : formatCurrency(p.value)}</span>
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
    <div className="bg-[#181A2F] p-8 rounded-xl border border-[#37415C]/20 shadow-sm relative overflow-hidden h-full">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h4 className="font-serif text-2xl font-bold text-white">{title}</h4>
          <p className="text-[#FDA481]/50 text-sm">Revenue vs Expenditure over 30 days</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FDA481]"></div>
            <span className="text-white/70">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#B4182D]"></div>
            <span className="text-white/70">Expenditure</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FDA481" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#FDA481" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#37415C" vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#FDA48140", fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#FDA48140", fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#FDA481"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRev)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#FDA481" }}
            />
            <Line
                type="monotone"
                dataKey="spend"
                name="Expenditure"
                stroke="#B4182D"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between px-2 text-[10px] font-bold text-[#FDA481]/30 uppercase tracking-widest">
        <span>WK 01</span>
        <span>WK 02</span>
        <span>WK 03</span>
        <span>WK 04</span>
      </div>
    </div>
  );
}
