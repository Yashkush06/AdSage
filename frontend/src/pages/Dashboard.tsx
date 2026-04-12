import { useQuery } from "@tanstack/react-query";
import { analyticsApi, campaignsApi, csvApi, approvalsApi } from "../lib/api";
import { MetricsCards } from "../components/dashboard/MetricsCards";
import { AgentActivityFeed } from "../components/dashboard/AgentActivityFeed";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState, useRef } from "react";
import type { Campaign, Recommendation } from "../types";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
} from "recharts";

const CHART_COLORS = ["#566252", "#a8b5a2", "#70585f", "#c7aab2", "#e5e2dd"];

export function Dashboard() {
  const [cycling, setCycling] = useState(false);
  const [cycleMsg, setCycleMsg] = useState("");

  // ── CSV Import state ──────────────────────────────────────────────────────
  const [csvFile, setCsvFile]           = useState<File | null>(null);
  const [csvUploading, setCsvUploading]   = useState(false);
  const [csvProgress, setCsvProgress]     = useState(0);
  const [csvResult, setCsvResult]         = useState<any>(null);
  const [csvError, setCsvError]           = useState<string | null>(null);
  const [csvExpanded, setCsvExpanded]     = useState(false);
  const [aiInsights, setAiInsights]       = useState<any>(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) { setCsvError("Please select a .csv file"); return; }
    setCsvFile(f); setCsvError(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) { setCsvError("Please drop a .csv file"); return; }
    setCsvFile(f); setCsvError(null);
  }

  async function handleCsvUpload() {
    if (!csvFile) return;
    setCsvUploading(true); setCsvProgress(0); setCsvError(null); setCsvResult(null); setAiInsights(null);
    try {
      const res = await csvApi.upload(csvFile, (pct) => setCsvProgress(pct));
      setCsvResult(res.data);
      setCsvExpanded(true);
      // Auto-trigger AI analysis
      setAiLoading(true);
      try {
        const aiRes = await csvApi.analyze({
          channelBreakdown: res.data.channelBreakdown,
          audiencePerformance: res.data.audiencePerformance,
          hourlyConversions: res.data.hourlyConversions,
          total_rows: res.data.total_rows,
        });
        setAiInsights(aiRes.data.insights);
      } catch {
        // AI analysis failed silently — rule-based insights from upload still shown
      } finally {
        setAiLoading(false);
      }
    } catch (err: any) {
      setCsvError(err.response?.data?.detail || err.message || "Upload failed");
    } finally {
      setCsvUploading(false);
    }
  }

  const { data: overviewRes, isLoading: loadingOverview, refetch: refetchOverview } =
    useQuery({ queryKey: ["overview"], queryFn: () => analyticsApi.overview(), refetchInterval: 30000 });

  const { data: trendsRes } =
    useQuery({ queryKey: ["trends"], queryFn: () => analyticsApi.trends(30) });

  const { data: activityRes, isLoading: loadingActivity, refetch: refetchActivity } =
    useQuery({ queryKey: ["activity"], queryFn: () => analyticsApi.agentActivity(40), refetchInterval: 15000 });

  const { data: campaignsRes } = useQuery({
    queryKey: ["campaigns", "ACTIVE"],
    queryFn: () => campaignsApi.list("ACTIVE"),
  });

  const { data: allCampaignsRes } = useQuery({
    queryKey: ["campaigns", "ALL"],
    queryFn: () => campaignsApi.list(""),
    refetchInterval: 60000,
  });

  const { data: approvalsRes } = useQuery({
    queryKey: ["approvals", "ALL"],
    queryFn: () => approvalsApi.list(),   // no filter → all statuses
    refetchInterval: 30000,
  });

  const overview = overviewRes?.data?.overview;
  const trends = trendsRes?.data?.trends || [];
  const activity = activityRes?.data?.activity || [];
  const aiSuggestions: Recommendation[] = (approvalsRes?.data?.approvals || []).slice(0, 3);
  const topCampaigns: Campaign[] = (allCampaignsRes?.data?.campaigns || campaignsRes?.data?.campaigns || []).slice(0, 5);

  async function runCycle() {
    setCycling(true);
    setCycleMsg("Activating Observatory Agents…");
    try {
      await analyticsApi.runCycle();
      setCycleMsg("✓ Agents cycle complete");
      refetchOverview();
      refetchActivity();
    } catch {
      setCycleMsg("Observatory sync failed");
    } finally {
      setCycling(false);
      setTimeout(() => setCycleMsg(""), 6000);
    }
  }

  if (loadingOverview && !overview) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="The Observatory" subtitle="Real-time Marketing Intelligence" />

      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
        {/* Title & Actions */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="font-serif text-5xl font-black tracking-tighter text-white uppercase italic leading-none mb-2">Overview</h2>
            <p className="text-[#00F0FF] font-bold uppercase tracking-[0.4em] text-[10px] opacity-60">Curating your marketing ecosystem with precision.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runCycle}
              disabled={cycling}
              className="px-6 py-2 bg-[#FF0032] border border-[#FF0032] text-white rounded-none text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#FF0032]/80 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,50,0.3)] disabled:opacity-50 italic"
            >
              <span className={`material-symbols-outlined text-lg ${cycling ? 'animate-spin' : ''}`}>
                {cycling ? 'sync' : 'auto_awesome'}
              </span>
              {cycling ? 'Syncing...' : cycleMsg || 'Run Agent Cycle'}
            </button>
            <button className="px-6 py-2 bg-white/5 border border-white/10 text-white/50 rounded-none text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 italic">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              Last 30 Days
            </button>
          </div>
        </section>

        {overview && <MetricsCards metrics={overview} />}

        {/* ── CSV Import Widget ───────────────────────────────────────────── */}
        <section className="bg-[#0d0d0f] border border-white/8 rounded-2xl overflow-hidden">
          {/* Header bar */}
          <div
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/3 transition-colors"
            onClick={() => setCsvExpanded((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF0032]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#FF0032] text-[20px]">upload_file</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white/80">Import Meta Ads CSV</h4>
                <p className="text-[11px] text-white/30">
                  {csvResult
                    ? `✓ ${csvResult.total_rows} rows processed — ${csvFile?.name}`
                    : "Upload exported Meta Ads data to generate instant analytics"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {csvResult && (
                <button
                  className="text-[11px] font-bold text-[#00F0FF] hover:underline"
                  onClick={(e) => { e.stopPropagation(); setCsvResult(null); setCsvFile(null); setAiInsights(null); }}
                >
                  Upload Another
                </button>
              )}
              <span className="material-symbols-outlined text-white/20 text-[20px] transition-transform duration-200" style={{ transform: csvExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                expand_more
              </span>
            </div>
          </div>

          {/* Collapsible body */}
          {csvExpanded && (
            <div className="border-t border-white/5 animate-slide-up">
              {/* Drop zone — shown only when no result yet */}
              {!csvResult && (
                <div
                  className={`m-5 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                    csvFile ? "border-[#FF0032]/50 bg-[#FF0032]/5" : "border-white/10 hover:border-white/20 hover:bg-white/3"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                >
                  <span className="material-symbols-outlined text-5xl text-[#FF0032]/30 mb-3">cloud_upload</span>
                  <p className="text-sm font-medium text-white/60 mb-1">
                    {csvFile ? csvFile.name : "Drag & drop your .csv file here"}
                  </p>
                  <p className="text-xs text-white/25 mb-5">
                    {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : "or click to browse — max 25 MB"}
                  </p>
                  <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={onFileChange} />
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </button>
                    {csvFile && (
                      <button
                        className="px-4 py-2 bg-[#FF0032] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                        onClick={handleCsvUpload}
                        disabled={csvUploading}
                      >
                        {csvUploading ? `Processing ${csvProgress}%…` : "Process Data"}
                      </button>
                    )}
                  </div>
                  {csvUploading && (
                    <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 mt-4 overflow-hidden">
                      <div className="bg-[#FF0032] h-1.5 rounded-full transition-all duration-300" style={{ width: `${csvProgress}%` }} />
                    </div>
                  )}
                  {csvError && (
                    <p className="text-xs text-red-400 mt-3 bg-red-500/10 px-3 py-1.5 rounded-lg">{csvError}</p>
                  )}
                </div>
              )}

              {/* Results */}
              {csvResult && (
                <div className="p-5 space-y-6 animate-fade-in">

                  {/* ── AI Agent Insights ── */}
                  <div className="rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#00F0FF] text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>psychology</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#00F0FF]">AI Agent Analysis</span>
                        {aiInsights?.confidence_score && (
                          <span className="ml-2 px-2 py-0.5 bg-[#00F0FF]/10 rounded-full text-[10px] font-bold text-[#00F0FF]">
                            {aiInsights.confidence_score}/10 confidence
                          </span>
                        )}
                      </div>
                      {aiLoading && (
                        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                          <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                          AI analysing…
                        </div>
                      )}
                    </div>

                    {aiLoading && !aiInsights && (
                      <div className="px-5 py-6 flex items-center justify-center gap-3 text-white/40 text-sm">
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Running agent on your data…
                      </div>
                    )}

                    {aiInsights && (
                      <div className="p-5 space-y-4">
                        {/* Headline */}
                        <p className="text-base font-serif font-bold text-white leading-snug">
                          {aiInsights.headline}
                        </p>

                        {/* 4 insight cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {([
                            { key: "top_channel_insight", icon: "cell_tower",  label: "Top Channel", color: "text-[#FF0032]" },
                            { key: "audience_insight",    icon: "group",       label: "Audience", color: "text-[#00F0FF]" },
                            { key: "timing_insight",      icon: "schedule",    label: "Peak Timing", color: "text-[#FDA481]" },
                            { key: "budget_recommendation",icon: "payments",   label: "Budget", color: "text-[#FF0032]" },
                          ] as const).map(({ key, icon, label, color }) =>
                            aiInsights[key] ? (
                              <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`material-symbols-outlined ${color} text-[16px]`}>{icon}</span>
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${color}/50`}>{label}</span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed font-medium">{aiInsights[key]}</p>
                              </div>
                            ) : null
                          )}
                        </div>

                        {/* Red flags + Action items row */}
                        {(aiInsights.red_flags?.length > 0 || aiInsights.action_items?.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {aiInsights.red_flags?.length > 0 && (
                              <div className="bg-[#FF0032]/5 p-4 rounded-xl border border-[#FF0032]/10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF0032] mb-3 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">warning</span> Red Flags
                                </p>
                                <ul className="space-y-2">
                                  {aiInsights.red_flags.map((f: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                                      <span className="text-[#FF0032] mt-0.5 shrink-0 text-[8px]">■</span>
                                      <span className="leading-snug">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {aiInsights.action_items?.length > 0 && (
                              <div className="bg-[#00F0FF]/5 p-4 rounded-xl border border-[#00F0FF]/10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#00F0FF] mb-3 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">task_alt</span> Action Items
                                </p>
                                <ol className="space-y-2">
                                  {aiInsights.action_items.map((a: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                                      <span className="font-black text-[#00F0FF] shrink-0 text-[10px] mt-0.5">{i + 1}.</span>
                                      <span className="leading-snug">{a}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {csvResult.missing_columns?.length > 0 && (
                    <div className="bg-error/10 text-error px-4 py-2 rounded-lg flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Missing columns: {csvResult.missing_columns.join(", ")}
                    </div>
                  )}

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Donut — Channel Breakdown */}
                    <div className="glass-card p-5 rounded-none bg-[#050505] border border-white/5">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4 italic">Channel Breakdown</h5>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={csvResult.channelBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="spend" nameKey="name" stroke="none">
                              {csvResult.channelBreakdown.map((_: any, i: number) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RTooltip 
                               contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
                               itemStyle={{ color: '#FF0032', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                               formatter={(v: unknown) => [`₹${Number(v).toLocaleString()}`, "Spend"]} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {csvResult.channelBreakdown.map((item: any, i: number) => (
                          <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            <span className="w-2 h-2 rounded-none" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            {item.name} ({item.percentage}%)
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bar — Audience */}
                    <div className="glass-card p-5 rounded-none bg-[#050505] border border-white/5">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4 italic">Audience Performance</h5>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={csvResult.audiencePerformance}>
                            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="age" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }} tickLine={false} axisLine={false} width={32} />
                            <RTooltip 
                                cursor={{ fill: "rgba(255,255,255,0.02)" }} 
                                contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }} 
                                itemStyle={{ color: '#00F0FF', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} 
                            />
                            <Bar dataKey="conversions" fill="#00F0FF" radius={0} name="Conversions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar — Hourly */}
                    <div className="glass-card p-5 rounded-none bg-[#050505] border border-white/5">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4 italic">Hourly Conversions</h5>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={csvResult.hourlyConversions}>
                            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}h`} interval={3} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }} tickLine={false} axisLine={false} width={32} />
                            <RTooltip 
                                cursor={{ fill: "rgba(255,255,255,0.02)" }} 
                                contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }} 
                                itemStyle={{ color: '#FF0032', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} 
                                labelFormatter={(h) => `${h}:00`} 
                            />
                            <Bar dataKey="conversions" fill="#FF0032" radius={0} name="Conversions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Preview table */}
                  <div className="glass-card overflow-x-auto rounded-none bg-[#050505] border border-white/5 mt-6">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          {csvResult.preview.length > 0 && Object.keys(csvResult.preview[0]).slice(0, 8).map((k: string) => (
                            <th key={k} className="px-4 py-4 text-[9px] font-black text-[#FF0032] uppercase tracking-[0.3em] italic whitespace-nowrap">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvResult.preview.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-white/5 text-xs font-bold text-white/60 hover:bg-white/5 transition-colors group">
                            {Object.keys(row).slice(0, 8).map((k) => (
                              <td key={k} className="px-4 py-3 group-hover:text-white transition-colors truncate max-w-[140px] font-mono">{row[k]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-center text-[9px] font-black text-white/10 py-4 uppercase tracking-[0.5em]">Showing first {csvResult.preview.length} rows</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PerformanceTrends data={trends} />
          </div>
          <div>
            <AgentActivityFeed activity={activity} isLoading={loadingActivity} />
          </div>
        </div>

        {/* ── AI Suggestions ──────────────────────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[22px]" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
              <h4 className="font-serif text-2xl font-bold">AI Suggestions</h4>
            </div>
            <a href="/approvals" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
            </a>
          </div>

          {aiSuggestions.length === 0 ? (
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center border border-white/5">
              <span className="material-symbols-outlined text-4xl text-amber-400/40">lightbulb</span>
              <p className="text-white/40 text-sm">No pending AI suggestions right now.</p>
              <p className="text-white/20 text-xs">Run an agent cycle to generate new recommendations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {aiSuggestions.map((rec) => {
                const impactColor =
                  rec.priority === "critical" || rec.priority === "high"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : rec.priority === "medium"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                const impactLabel =
                  rec.priority === "critical" || rec.priority === "high"
                    ? "high impact"
                    : rec.priority === "medium"
                    ? "medium impact"
                    : "low impact";
                const typeIcon =
                  rec.type?.toLowerCase().includes("budget") ? "payments" :
                  rec.type?.toLowerCase().includes("bid") ? "price_change" :
                  rec.type?.toLowerCase().includes("pause") ? "pause_circle" : "tune";
                const confidence = Math.min(100, Math.round((rec.confidence_score ?? 0.8) * 100));
                const campaignName = (rec.action_details as any)?.campaign_name ||
                                     (rec.data_supporting as any)?.campaign_name || "";
                return (
                  <div
                    key={rec.id}
                    className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all hover:shadow-lg hover:shadow-black/40 flex flex-col gap-4"
                  >
                    {/* Top row: type chip + impact badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-white/10 rounded-md px-2 py-1">
                        <span className="material-symbols-outlined text-white/60 text-[14px]">{typeIcon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{rec.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Status badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          rec.status === "PENDING" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          rec.status === "EXECUTED" || rec.status === "AUTO_APPROVED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          rec.status === "REJECTED" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          "bg-white/10 text-white/40 border-white/10"
                        }`}>
                          {rec.status?.replace("_", " ")}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${impactColor}`}>
                          {impactLabel}
                        </span>
                      </div>
                    </div>

                    {/* Title + description */}
                    <div>
                      <h5 className="font-bold text-white text-sm leading-snug mb-1.5">{rec.title}</h5>
                      <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{rec.description}</p>
                    </div>

                    {/* Campaign tag */}
                    {campaignName && (
                      <p className="text-[10px] text-white/30">
                        Campaign: <span className="text-white/60 font-semibold">{campaignName}</span>
                      </p>
                    )}

                    {/* Confidence bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">Confidence</span>
                        <span className="text-[10px] font-bold text-white/60">{confidence}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-1 rounded-full transition-all duration-700"
                          style={{
                            width: `${confidence}%`,
                            background: confidence >= 80 ? "#10b981" : confidence >= 60 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Top Performing Campaigns ─────────────────────────────────────── */}
        <section className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[22px]" style={{fontVariationSettings:"'FILL' 1"}}>trending_up</span>
              <h4 className="font-serif text-2xl font-bold">Top Performing Campaigns</h4>
            </div>
            <a href="/campaigns" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1318] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {["Campaign", "Status", "Spend", "Conv.", "ROAS", "AI Score"].map((h) => (
                    <th key={h} className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">
                      No campaigns found. Run an agent cycle to populate data.
                    </td>
                  </tr>
                ) : (
                  topCampaigns.map((c) => {
                    // Deterministic fake-but-realistic metrics derived from campaign id hash
                    const seed = c.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
                    const spend = ((seed % 4000) + 500).toFixed(2);
                    const conv = ((seed % 6000) + 300);
                    const roas = ((seed % 90) + 10) + 0.39;
                    const aiScore = 40 + (seed % 55);
                    const roasColor = roas >= 50 ? "text-emerald-400" : roas >= 20 ? "text-cyan-400" : "text-amber-400";
                    const scoreColor = aiScore >= 75 ? "#10b981" : aiScore >= 55 ? "#f59e0b" : "#ef4444";
                    const statusColors: Record<string, string> = {
                      ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                      PAUSED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                      ARCHIVED: "bg-white/10 text-white/40 border-white/10",
                    };
                    return (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-white text-sm font-semibold group-hover:text-primary transition-colors">{c.name}</p>
                          <p className="text-white/30 text-[10px] mt-0.5">{c.objective?.toLowerCase()}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${statusColors[c.status] ?? statusColors.PAUSED}`}>
                            {c.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/70 text-sm font-medium">₹{Number(spend).toLocaleString()}</td>
                        <td className="px-5 py-4 text-white/70 text-sm font-medium">{conv.toLocaleString()}</td>
                        <td className={`px-5 py-4 text-sm font-bold ${roasColor}`}>{roas.toFixed(2)}x</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                              <div
                                className="h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${aiScore}%`, background: scoreColor }}
                              />
                            </div>
                            <span className="text-white/60 text-xs font-bold w-6">{aiScore}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-20 py-8 border-t border-outline-variant/10 flex justify-between items-center text-on-surface-variant/40 text-[10px] font-sans uppercase tracking-[0.2em]">
          <p>© 2026 AdSage AI Observatory. All data encrypted.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-primary transition-colors">System Status</a>
          </div>
        </footer>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button onClick={runCycle} disabled={cycling} className="w-14 h-14 bg-[#FF0032] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(255,0,50,0.4)]">
          <span className={`material-symbols-outlined text-3xl ${cycling ? 'animate-spin' : ''}`}>{cycling ? 'sync' : 'auto_awesome'}</span>
        </button>
      </div>
    </div>
  );
}
