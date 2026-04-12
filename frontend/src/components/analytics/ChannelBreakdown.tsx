import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Channel {
  name: string;
  spend: number;
  percentage: number;
  conversions: number;
  roas: number;
}

interface Props {
  data?: Channel[];
}

const FALLBACK: Channel[] = [
  { name: "Facebook Feed",      spend: 5848, percentage: 34, conversions: 412, roas: 4.2 },
  { name: "Instagram Stories",  spend: 3926, percentage: 19, conversions: 298, roas: 3.8 },
  { name: "Instagram Feed",     spend: 3547, percentage: 14, conversions: 201, roas: 3.5 },
  { name: "Audience Network",   spend: 2073, percentage: 13, conversions: 164, roas: 2.9 },
  { name: "Messenger",          spend:  950, percentage:  5, conversions:  88, roas: 2.4 },
  { name: "Reels",              spend: 2656, percentage: 15, conversions: 220, roas: 3.1 },
];

// Dark reds + muted tones matching the screenshot
const COLORS = ["#FF0032", "#CC0028", "#99001E", "#660014", "#FF3355", "#FF6677"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: Channel = payload[0].payload;
  return (
    <div className="bg-[#0d0d0f] border border-white/10 rounded-xl p-4 text-xs shadow-2xl min-w-[160px]">
      <p className="font-black text-white uppercase italic tracking-tighter mb-2">{d.name}</p>
      <div className="space-y-1 text-white/50">
        <div className="flex justify-between gap-6"><span>Spend</span><span className="text-white font-bold">₹{d.spend.toLocaleString()}</span></div>
        <div className="flex justify-between gap-6"><span>Conv.</span><span className="text-white font-bold">{d.conversions}</span></div>
        <div className="flex justify-between gap-6"><span>ROAS</span><span className="text-[#FF0032] font-bold">{d.roas}x</span></div>
      </div>
    </div>
  );
};

export function ChannelBreakdown({ data = FALLBACK }: Props) {
  const total = data.reduce((s, d) => s + d.spend, 0);

  return (
    <div className="bg-[#0a0a0c] border border-white/5 rounded-xl p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#FF0032] text-lg">donut_large</span>
        <h4 className="font-black text-white uppercase italic tracking-tighter text-lg">Channel Breakdown</h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut */}
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={72}
                paddingAngle={3}
                dataKey="spend"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 w-full">
          {data.map((ch, i) => (
            <div key={ch.name} className="flex items-center gap-3 group">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-black text-white/70 uppercase italic tracking-tight truncate">{ch.name}</span>
                  <span className="text-[11px] font-black text-white/40 ml-2 flex-shrink-0">{ch.percentage}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-xl overflow-hidden">
                  <div
                    className="h-full rounded-xl transition-all duration-700"
                    style={{ width: `${ch.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <p className="text-[9px] text-white/20 font-black mt-0.5">₹{ch.spend.toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-white/5 flex justify-between">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Spend</span>
            <span className="text-[10px] font-black text-[#FF0032]">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
