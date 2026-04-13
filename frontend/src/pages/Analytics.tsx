  import { useQuery } from "@tanstack/react-query";
import { campaignsApi, analyticsApi } from "../lib/api";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { FunnelVisualization } from "../components/analytics/FunnelVisualization";
import { AudienceInsights } from "../components/analytics/AudienceInsights";
import { ChannelBreakdown } from "../components/analytics/ChannelBreakdown";
import { PeakConversions } from "../components/analytics/PeakConversions";
import { TopCreatives } from "../components/analytics/TopCreatives";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { Campaign } from "../types";
import { WaveButton } from "../components/shared/WaveButton";

// Static fallback data so the page is never blank
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FALLBACK_TRENDS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const date = d.toISOString().slice(0, 10);
  const spend = 4000 + Math.sin(i * 0.4) * 800 + Math.random() * 400;
  const roas = 3.2 + Math.sin(i * 0.3) * 0.8 + Math.random() * 0.3;
  return { date, spend: Math.round(spend), revenue: Math.round(spend * roas), roas: Math.round(roas * 100) / 100, conversions: Math.round(spend / 320), campaign_id: "demo_1_1", campaign_name: "All Campaigns" };
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FALLBACK_FUNNEL = [
  { step: "Ad Click",     label: "Ad Clicks",         count: 48200, drop_rate: 0 },
  { step: "Landing Page", label: "Landing Page Views", count: 39800, drop_rate: 17.4 },
  { step: "Add to Cart",  label: "Add to Cart",        count: 18200, drop_rate: 54.3 },
  { step: "Purchase",     label: "Purchases",          count: 4100,  drop_rate: 77.5 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FALLBACK_AUDIENCE = [
  { age: "18-24", gender: "female", spend: 18400, revenue: 92000, conversions: 312, cpa: 59, roas: 5.0 },
  { age: "18-24", gender: "male",   spend: 15200, revenue: 68400, conversions: 248, cpa: 61, roas: 4.5 },
  { age: "25-34", gender: "female", spend: 22100, revenue: 79560, conversions: 290, cpa: 76, roas: 3.6 },
  { age: "25-34", gender: "male",   spend: 19800, revenue: 63360, conversions: 231, cpa: 86, roas: 3.2 },
  { age: "35-44", gender: "female", spend: 11200, revenue: 30240, conversions: 140, cpa: 80, roas: 2.7 },
  { age: "35-44", gender: "male",   spend: 9600,  revenue: 23040, conversions: 112, cpa: 86, roas: 2.4 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FALLBACK_INSIGHTS = {
  headline: "Strong retargeting performance offsets underperforming awareness campaigns",
  key_wins: ["Retargeting ROAS at 5.1x", "Sneaker Drop improving week-over-week"],
  key_concerns: ["Hoodie Promo CPA critical", "Video campaign below break-even"],
  action_items: ["Pause Hoodie Promo", "Scale retargeting budget by 30%"],
  week_rating: 7,
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#37415C]/40 rounded-lg ${className}`} />;
}

export function Analytics() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [cycling, setCycling] = useState(false);
  const [cycleMsg, setCycleMsg] = useState("");

  async function runCycle() {
    setCycling(true);
    setCycleMsg("Syncing agents…");
    try {
      await analyticsApi.runCycle();
      setCycleMsg("✓ Pulse complete");
    } catch {
      setCycleMsg("Sync failed");
    } finally {
      setCycling(false);
      setTimeout(() => setCycleMsg(""), 4000);
    }
  }

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

  const trends   = trendRes?.data?.trends?.length   ? trendRes.data.trends   : FALLBACK_TRENDS;
  const funnel   = funnelRes?.data?.funnel?.funnel_steps?.length ? funnelRes.data.funnel.funnel_steps : FALLBACK_FUNNEL;
  const audience = audienceRes?.data?.breakdown?.audience_segments?.length ? audienceRes.data.breakdown.audience_segments : FALLBACK_AUDIENCE;
  const insights = insightsRes?.data?.insights
    ? {
        ...FALLBACK_INSIGHTS,
        ...insightsRes.data.insights,
        key_wins:     Array.isArray(insightsRes.data.insights.key_wins)     ? insightsRes.data.insights.key_wins     : FALLBACK_INSIGHTS.key_wins,
        key_concerns: Array.isArray(insightsRes.data.insights.key_concerns) ? insightsRes.data.insights.key_concerns : FALLBACK_INSIGHTS.key_concerns,
      }
    : FALLBACK_INSIGHTS;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Header title="Marketing Intelligence" subtitle="Deep Analytical Core" />

      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
        {/* Header row */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-white uppercase italic">Intelligence</h2>
            <p className="text-[#00F0FF]/60 font-medium">Synced with Ad Manager. Deep analytical pulse active.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-6 py-2 bg-[#121214] border border-white/5 rounded-xl shadow-sm">
              <span className="text-[10px] font-black uppercase text-white/30 tracking-[.3em] mr-2">Archive:</span>
              {loadingCampaigns ? (
                <Skeleton className="w-32 h-4" />
              ) : (
                <select
                  value={cid}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-[#FF0032] outline-none cursor-pointer uppercase italic"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#121214]">{c.name}</option>
                  ))}
                </select>
              )}
            </div>
            <WaveButton
              id="analytics-initiate-pulse"
              onClick={runCycle}
              disabled={cycling}
              label={cycling ? 'Syncing…' : cycleMsg || 'Initiate Pulse'}
              hoverLabel="Deep Scan"
            />
          </div>
        </section>

        {/* AI Insights Bento */}
        {loadingInsights ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="md:col-span-2 h-52" />
            <Skeleton className="h-52" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-[#121214] p-10 rounded-xl border border-white/5 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4">
                <span className="material-symbols-outlined text-white text-[120px]">psychology</span>
              </div>
              <div className="flex items-center gap-2 mb-8 text-[#FF0032]">
                <span className="material-symbols-outlined text-lg">bolt</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Spider-Sense Diagnostic</span>
              </div>
              <h3 className="text-3xl font-serif font-black text-white italic mb-4 uppercase tracking-tighter">{insights.headline}</h3>
              <div className="flex gap-16 mt-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-[#00F0FF] tracking-widest">Growth Vectors</p>
                  {insights.key_wins.slice(0, 2).map((w: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/80">
                      <span className="material-symbols-outlined text-[#00F0FF] text-sm">check_circle</span>
                      {w}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-[#FF0032] tracking-widest">Risk Flux</p>
                  {insights.key_concerns.slice(0, 2).map((c: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/40">
                      <span className="material-symbols-outlined text-[#FF0032] text-sm">warning</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-[#FF0032] p-10 rounded-xl flex flex-col justify-between shadow-[0_0_30px_rgba(255,0,50,0.2)] relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/20 rounded-full group-hover:scale-110 transition-transform" />
              <div className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Pulse Index</div>
              <div>
                <div className="text-6xl font-serif font-black text-white italic mb-2 tracking-tighter">{insights.week_rating}/10</div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Operational Sync Level</p>
              </div>
              <WaveButton
                id="analytics-network-briefing"
                onClick={runCycle}
                disabled={cycling}
                label={cycling ? 'Syncing…' : 'Network Briefing'}
                hoverLabel="Pulse Report"
                variant="light"
                className="w-full justify-center"
              />
            </div>
          </div>
        )}

        {/* Trends chart */}
        {loadingTrends ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <PerformanceTrends data={trends} title="Global Ecosystem Pulse" />
        )}

        {/* Row 1: Channel Breakdown + Audience Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChannelBreakdown />
          {loadingAudience ? <Skeleton className="h-80" /> : <AudienceInsights segments={audience} />}
        </div>

        {/* Row 2: Hourly Conversions + Top Creatives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PeakConversions />
          <TopCreatives />
        </div>

        {/* Row 3: Funnel */}
        <div className="mb-12">
          {loadingFunnel ? <Skeleton className="h-96" /> : <FunnelVisualization steps={funnel} />}
        </div>
      </main>
    </div>
  );
}
