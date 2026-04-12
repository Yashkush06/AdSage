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
    <div className="bg-[#181A2F] p-4 rounded-xl border border-[#37415C] shadow-2xl font-body text-[10px] uppercase font-bold tracking-widest">
      <p className="border-b border-[#37415C]/30 pb-2 mb-2 text-[#FDA481]">{label}</p>
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
    <div className="bg-[#181A2F] p-8 rounded-xl border border-[#37415C]/20 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="font-serif text-xl font-bold text-white">Audience Pulse</h4>
          <p className="text-[#FDA481]/50 text-xs tracking-tight">Performance by Demographics</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest bg-[#242E49] border border-[#37415C]/30 px-4 py-2 rounded-full shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FDA481]"></div>
            <span className="text-white/70">Male</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#B4182D]"></div>
            <span className="text-white/70">Female</span>
          </div>
        </div>
      </div>

      <div className="h-56 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="#37415C" vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="age" 
              tick={{ fontSize: 10, fill: "#FDA48140", fontWeight: 700 }} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#FDA48140", fontWeight: 700 }} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `${v}x`} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FDA48105' }} />
            <Bar dataKey="Male ROAS" fill="#FDA481" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="Female ROAS" fill="#B4182D" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase text-[#FDA481]/50 tracking-[0.2em] mb-4">Top Segments</p>
        {[...segments]
          .sort((a, b) => b.roas - a.roas)
          .slice(0, 3)
          .map((s) => (
            <div
              key={`${s.age}-${s.gender}`}
              className="group flex items-center justify-between p-4 bg-[#242E49]/50 border border-[#37415C]/30 rounded-xl hover:border-[#FDA481] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#181A2F] flex items-center justify-center border border-[#37415C]/30">
                  <span className="material-symbols-outlined text-[16px] text-[#FDA481]/50">person</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{s.age}</p>
                  <p className="text-[10px] text-[#FDA481]/40 uppercase tracking-widest">{s.gender}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#FDA481]">{s.roas.toFixed(2)}x</p>
                <p className="text-[10px] text-[#FDA481]/40 uppercase font-bold tracking-widest">Efficiency</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
