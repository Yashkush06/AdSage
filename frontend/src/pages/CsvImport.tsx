import { useState, useRef } from "react";
import { csvApi } from "../lib/api";
import { Header } from "../components/shared/Header";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF0032", "#00F0FF", "#FFFFFF", "#333333", "#111111"];

export function CsvImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.endsWith(".csv")) {
        setFile(selected);
        setError(null);
      } else {
        setFile(null);
        setError("Please select a .csv file");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (dropped.name.endsWith(".csv")) {
        setFile(dropped);
        setError(null);
      } else {
        setFile(null);
        setError("Please drop a .csv file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const res = await csvApi.upload(file, (pct: number) => setProgress(pct));
      setResult(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="CSV Import" subtitle="Data Ingestion" />

      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
        <section className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="font-serif text-5xl font-black tracking-tighter text-white uppercase italic leading-none mb-2">Data Stream</h2>
            <p className="text-[#00F0FF] font-bold uppercase tracking-[0.4em] text-[10px] opacity-60">Injest Meta Ads frequency data into the Verse.</p>
          </div>
        </section>

        {!result && (
          <div
            className={`border-2 border-dashed rounded-none p-16 flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
              file ? "border-[#FF0032] bg-[#FF0032]/5" : "border-white/5 bg-[#0A0A0C] hover:border-[#00F0FF]/30 hover:bg-white/5"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF0032]/20 via-transparent to-transparent" />
            <span className="material-symbols-outlined text-6xl text-[#FF0032] mb-6 cursor-default shadow-[0_0_20px_rgba(255,0,50,0.3)]">
              upload_file
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">
              {file ? file.name : "Neural Drop Sequence"}
            </h3>
            <p className="text-white/30 mb-8 max-w-md text-center text-[10px] font-bold uppercase tracking-[0.2em]">
              Synchronize Meta Ads artifacts. Universal schema compatibility active.
            </p>

            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className="flex gap-4">
              <button
                className="px-6 py-3 bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all rounded-none italic"
                onClick={() => fileInputRef.current?.click()}
              >
                Injest Artifacts
              </button>
              {file && (
                <button
                  className="px-8 py-3 bg-[#FF0032] text-white font-black rounded-none text-[10px] uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,0,50,0.3)] hover-glitch active:scale-[0.98] transition-all disabled:opacity-50"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? `Injesting ${progress}%` : "Initiate Protocol"}
                </button>
              )}
            </div>

            {error && <p className="text-error mt-4 text-sm bg-error/10 px-4 py-2 rounded-md">{error}</p>}
          </div>
        )}

        {isUploading && progress < 100 && (
          <div className="w-full bg-white/5 rounded-none h-1 mt-6 overflow-hidden border border-white/5">
            <div
              className="bg-[#FF0032] h-1 rounded-none transition-all duration-300 shadow-[0_0_10px_#FF0032]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-[6px] border-l-[#FF0032] bg-[#FF0032]/5 rounded-none">
                <div className="flex items-center gap-5">
                    <span className="material-symbols-outlined text-[#FF0032] text-4xl shadow-[0_0_15px_rgba(255,0,50,0.3)]">bolt</span>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Injest Complete</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F0FF]">Decoded {result.total_rows} neural packets from {file?.name}</p>
                    </div>
                </div>
                <button className="btn-ghost text-sm" onClick={() => { setResult(null); setFile(null); }}>
                    Upload Another
                </button>
            </div>

            {result.missing_columns && result.missing_columns.length > 0 && (
              <div className="bg-error/10 text-error px-4 py-3 rounded-lg flex items-start gap-2">
                 <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
                 <p className="text-xs">Missing columns: {result.missing_columns.join(", ")}</p>
              </div>
            )}

            {/* AI Insights Bento */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {Object.entries(result.aiInsights).map(([key, text]) => (
                    <div key={key} className="glass-card p-6 border-t-[3px] border-t-[#FF0032] bg-[#0A0A0C] rounded-none hover:bg-white/5 transition-colors group">
                       <p className="text-[9px] font-black uppercase text-[#00F0FF] tracking-[0.4em] mb-3 flex items-center gap-2 opacity-60">
                           <span className="material-symbols-outlined text-[14px]">terminal</span>
                           {key.replace(/_/g, " ")}
                       </p>
                       <p className="text-xs font-bold text-white leading-relaxed uppercase tracking-wider italic">
                           {text as React.ReactNode}
                       </p>
                    </div>
                 ))}
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Channel Breakdown */}
              <div className="glass-card p-8 rounded-none bg-[#050505] border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-10 italic">Channel Velocity (Spend)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.channelBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="spend"
                        nameKey="name"
                        stroke="none"
                      >
                        {result.channelBreakdown.map((_e: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
                        itemStyle={{ color: '#FF0032', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        formatter={(value: unknown) => [`₹${Number(value).toLocaleString()}`, 'SPEND']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-6 justify-center mt-8">
                   {result.channelBreakdown.map((item: any, i: number) => (
                       <div key={item.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                           <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: COLORS[i % COLORS.length]}}></span>
                           <span>{item.name}</span>
                           <span className="text-[#FF0032]/80">({item.percentage}%)</span>
                       </div>
                   ))}
                </div>
              </div>

              {/* Audience Performance */}
              <div className="glass-card p-8 rounded-none bg-[#050505] border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-10 italic">Neural Demographics</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.audiencePerformance}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="age" tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900}} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                           cursor={{fill: 'rgba(255,255,255,0.02)'}}
                           contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
                           itemStyle={{ color: '#00F0FF', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                      />
                      <Bar dataKey="conversions" fill="#00F0FF" radius={0} name="PULSE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hourly Conversions */}
               <div className="glass-card p-10 lg:col-span-2 rounded-none bg-[#050505] border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-10 italic">Frequency Distribution (Hourly)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.hourlyConversions}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="hour" tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900}} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}:00`} />
                      <YAxis tick={{fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900}} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                           cursor={{fill: 'rgba(255,255,10,0.02)'}}
                           contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,0,50,0.2)', borderRadius: '0px' }}
                           itemStyle={{ color: '#FF0032', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                           labelFormatter={(h) => `${h}:00`}
                      />
                      <Bar dataKey="conversions" fill="#FF0032" radius={0} name="PULSE" shadow-lg />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Preview */}
               <div className="glass-card p-10 lg:col-span-2 overflow-x-auto rounded-none bg-[#050505] border border-white/5">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 italic">Raw Neural Dump</h3>
                   <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead>
                           <tr className="border-b border-white/5">
                               {result.preview.length > 0 && Object.keys(result.preview[0]).slice(0,8).map(k => (
                                   <th key={k} className="p-4 text-[9px] font-black text-[#FF0032] uppercase tracking-[0.3em] italic">{k}</th>
                               ))}
                           </tr>
                       </thead>
                       <tbody>
                           {result.preview.map((row: any, i: number) => (
                               <tr key={i} className="border-b border-white/5 text-xs font-bold text-white/60 hover:bg-white/5 transition-colors group">
                                   {Object.keys(row).slice(0,8).map(k => (
                                       <td key={k + String(i)} className="p-4 truncate max-w-[150px] font-mono group-hover:text-white transition-colors">{row[k]}</td>
                                   ))}
                               </tr>
                           ))}
                       </tbody>
                   </table>
                   <p className="text-[9px] font-black text-white/10 mt-8 text-center uppercase tracking-[0.5em]">Showing first {result.preview.length} rows</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
