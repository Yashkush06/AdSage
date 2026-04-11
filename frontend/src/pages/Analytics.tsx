import { useQuery } from "@tanstack/react-query";
import { campaignsApi, analyticsApi } from "../lib/api";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { FunnelVisualization } from "../components/analytics/FunnelVisualization";
import { AudienceInsights } from "../components/analytics/AudienceInsights";
import { TopCreatives } from "../components/analytics/TopCreatives";
import { PeakConversions } from "../components/analytics/PeakConversions";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { Campaign } from "../types";

// Static fallback data so the page is never blank


function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-highest rounded-lg ${className}`} />;
}

export function Analytics() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  const { data: campaignsRes, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => campaignsApi.list("ACTIVE"),
    retry: 1,
  });

  const campaigns: Campaign[] = campaignsRes?.data?.campaigns || [];
  const cid = selectedCampaign || campaigns[0]?.id || "";

  const { data: trendRes, isLoading: loadingTrends } = useQuery({
    queryKey: ["trends"],
    queryFn: () => analyticsApi.trends(30),
    retry: 1,
  });

  const { data: funnelRes, isLoading: loadingFunnel } = useQuery({
    queryKey: ["funnel", cid],
    queryFn: () => campaignsApi.funnel(cid),
    enabled: Boolean(cid),
    retry: 1,
  });

  const { data: audienceRes, isLoading: loadingAudience } = useQuery({
    queryKey: ["audience", cid],
    queryFn: () => campaignsApi.audience(cid),
    enabled: Boolean(cid),
    retry: 1,
  });

  const { data: insightsRes, isLoading: loadingInsights } = useQuery({
    queryKey: ["insights"],
    queryFn: () => analyticsApi.insights(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const trends   = trendRes?.data?.trends || [];
  const funnel   = funnelRes?.data?.funnel?.funnel_steps || [];
  const audience = audienceRes?.data?.breakdown?.audience_segments || [];
  const insights = insightsRes?.data?.insights;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Marketing Intelligence" subtitle="Deep Analytical Core" />

      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
        {/* Header row */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Analytics</h2>
            <p className="text-stone-500 font-medium">Extracting signal from the noise of your ecosystem.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-xl shadow-sm">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mr-2">Archive:</span>
              {loadingCampaigns ? (
                <Skeleton className="w-32 h-4" />
              ) : (
                <select
                  value={cid}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-primary outline-none cursor-pointer"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Generate Intelligence
            </button>
          </div>
        </section>

        {/* AI Insights Bento */}
        {loadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="md:col-span-2 h-52" />
            <Skeleton className="h-52" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="material-symbols-outlined text-primary/20 text-6xl group-hover:text-primary/40 transition-colors">model_training</span>
              </div>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined text-lg">psychology</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Agent Directive</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-on-surface mb-2">{insights.headline}</h3>
              <div className="flex gap-12 mt-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Growth Vectors</p>
                  {insights.key_wins.slice(0, 2).map((w: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-primary">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {w}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Risk Mitigation</p>
                  {insights.key_concerns.slice(0, 2).map((c: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-stone-500">
                      <span className="material-symbols-outlined text-sm text-error">warning</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-primary p-8 rounded-xl flex flex-col justify-between shadow-xl shadow-primary/10 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-black/10 rounded-full" />
              <div className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Success Core</div>
              <div>
                <div className="text-5xl font-serif font-bold text-white mb-2">{insights.week_rating}/10</div>
                <p className="text-white/80 text-sm font-medium">Observatory Performance Index</p>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors backdrop-blur">
                Full Briefing
              </button>
            </div>
          </div>
        )}

        {/* Trends chart */}
        {loadingTrends ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <PerformanceTrends data={trends} title="Global Ecosystem Pulse" />
        )}

        {/* Funnel + Audience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loadingFunnel ? <Skeleton className="h-96" /> : <FunnelVisualization steps={funnel} />}
          {loadingAudience ? <Skeleton className="h-96" /> : <AudienceInsights segments={audience} />}
        </div>

        {/* Creative Performance + Peak Conversions */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-lg">layers</span>
            <h3 className="font-serif text-xl font-bold text-on-surface">Creative & Time Intelligence</h3>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>
          <p className="text-stone-400 text-sm -mt-1">Identify which creatives convert best and when your audience is most active.</p>
        </div>

        <TopCreatives />
        <PeakConversions />

      </main>
    </div>
  );
}
