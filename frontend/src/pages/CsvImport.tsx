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

const COLORS = ["#566252", "#a8b5a2", "#70585f", "#c7aab2", "#e5e2dd"];

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
      const res = await csvApi.upload(file, (pct) => setProgress(pct));
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
            <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Data Import</h2>
            <p className="text-stone-500 font-medium">Upload Meta Ads exports to generate instant insights.</p>
          </div>
        </section>

        {!result && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
              file ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-container-low hover:border-primary/50 hover:bg-surface-variant/50"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <span className="material-symbols-outlined text-6xl text-primary/40 mb-4 cursor-default">
              cloud_upload
            </span>
            <h3 className="text-xl font-medium text-on-surface mb-2">
              {file ? file.name : "Drag & Drop CSV"}
            </h3>
            <p className="text-stone-500 mb-6 max-w-md text-center text-sm">
              Upload your Meta Ads exported data. We support flexible column naming formats.
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
                className="btn-ghost bg-surface border border-outline-variant/30 font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </button>
              {file && (
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? `Uploading ${progress}%` : "Process Data"}
                </button>
              )}
            </div>

            {error && <p className="text-error mt-4 text-sm bg-error/10 px-4 py-2 rounded-md">{error}</p>}
          </div>
        )}

        {isUploading && progress < 100 && (
          <div className="w-full bg-surface-variant rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-primary bg-primary/5">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface">Data Processed Successfully</h3>
                        <p className="text-sm text-stone-500">Parsed {result.total_rows} rows from {file?.name}</p>
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
                    <div key={key} className="glass-card p-6 border-t-2 border-t-primary">
                       <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-2 flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                           {key.replace(/_/g, " ")}
                       </p>
                       <p className="text-sm font-medium text-on-surface leading-relaxed">
                           {text as React.ReactNode}
                       </p>
                    </div>
                 ))}
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Channel Breakdown */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-serif font-bold mb-6">Channel Breakdown (Spend)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.channelBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="spend"
                        nameKey="name"
                      >
                        {result.channelBreakdown.map((_e: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spend']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                   {result.channelBreakdown.map((item: any, i: number) => (
                       <div key={item.name} className="flex items-center gap-2 text-xs font-medium">
                           <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length]}}></span>
                           <span>{item.name}</span>
                           <span className="text-stone-500">({item.percentage}%)</span>
                       </div>
                   ))}
                </div>
              </div>

              {/* Audience Performance */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-serif font-bold mb-6">Audience Performance</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.audiencePerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e2dd" />
                      <XAxis dataKey="age" tick={{fill: '#757871', fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: '#757871', fontSize: 12}} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                           cursor={{fill: '#f6f3ee'}}
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="conversions" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hourly Conversions */}
               <div className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-serif font-bold mb-6">Hourly Conversions</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.hourlyConversions}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e2dd" />
                      <XAxis dataKey="hour" tick={{fill: '#757871', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}:00`} />
                      <YAxis tick={{fill: '#757871', fontSize: 12}} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                           cursor={{fill: '#f6f3ee'}}
                           contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                           labelFormatter={(h) => `${h}:00`}
                      />
                      <Bar dataKey="conversions" fill="var(--primary-container)" radius={[4, 4, 0, 0]} name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Preview */}
               <div className="glass-card p-6 lg:col-span-2 overflow-x-auto">
                   <h3 className="text-lg font-serif font-bold mb-4">Raw Data Preview</h3>
                   <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead>
                           <tr className="border-b border-outline-variant/30">
                               {result.preview.length > 0 && Object.keys(result.preview[0]).slice(0,8).map(k => (
                                   <th key={k} className="p-3 text-xs font-bold text-stone-500 uppercase tracking-wider">{k}</th>
                               ))}
                           </tr>
                       </thead>
                       <tbody>
                           {result.preview.map((row: any, i: number) => (
                               <tr key={i} className="border-b border-outline-variant/10 text-sm hover:bg-surface-variant/20">
                                   {Object.keys(row).slice(0,8).map(k => (
                                       <td key={k + String(i)} className="p-3 truncate max-w-[150px]">{row[k]}</td>
                                   ))}
                               </tr>
                           ))}
                       </tbody>
                   </table>
                   <p className="text-xs text-stone-400 mt-4 text-center">Showing first {result.preview.length} rows</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
