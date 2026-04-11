import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AudienceSegment } from "../../types";

interface Props {
  segments: AudienceSegment[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-xl font-body text-[10px] uppercase font-bold tracking-widest text-primary">
      <p className="border-b border-outline-variant/10 pb-2 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 py-0.5" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span>{Number(p.value).toFixed(2)}x</span>
        </div>
      ))}
    </div>
  );
};

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
    <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="font-serif text-xl font-bold">Audience Pulse</h4>
          <p className="text-stone-400 text-xs tracking-tight">Performance by Demographics</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest bg-white border border-outline-variant/20 px-4 py-2 rounded-full shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-container"></div>
            <span>Female</span>
          </div>
        </div>
      </div>

      <div className="h-56 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="#e5e2dd" vertical={false} strokeDasharray="3 3" opacity={0.5} />
            <XAxis 
              dataKey="age" 
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `${v}x`} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f6f3ee' }} />
            <Bar dataKey="Male ROAS" fill="#566252" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="Female ROAS" fill="#a8b5a2" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase text-stone-400 tracking-[0.2em] mb-4">Top Segments</p>
        {[...segments]
          .sort((a, b) => b.roas - a.roas)
          .slice(0, 3)
          .map((s) => (
            <div
              key={`${s.age}-${s.gender}`}
              className="group flex items-center justify-between p-4 bg-white border border-outline-variant/30 rounded-xl hover:border-primary transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-stone-500">person</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{s.age}</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">{s.gender}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{s.roas.toFixed(2)}x</p>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Efficiency</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
