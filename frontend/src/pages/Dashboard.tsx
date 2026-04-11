import { useQuery } from "@tanstack/react-query";
import { analyticsApi, campaignsApi } from "../lib/api";
import { MetricsCards } from "../components/dashboard/MetricsCards";
import { AgentActivityFeed } from "../components/dashboard/AgentActivityFeed";
import { PerformanceTrends } from "../components/dashboard/PerformanceTrends";
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { Campaign } from "../types";

export function Dashboard() {
  const [cycling, setCycling] = useState(false);
  const [cycleMsg, setCycleMsg] = useState("");

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

  const overview = overviewRes?.data?.overview;
  const trends = trendsRes?.data?.trends || [];
  const activity = activityRes?.data?.activity || [];
  const priorityCampaigns: Campaign[] = (campaignsRes?.data?.campaigns || []).slice(0, 3);

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
            <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Overview</h2>
            <p className="text-stone-500 font-medium">Curating your marketing ecosystem with precision.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runCycle}
              disabled={cycling}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 text-primary rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-lg ${cycling ? 'animate-spin' : ''}`}>
                {cycling ? 'sync' : 'auto_awesome'}
              </span>
              {cycling ? 'Syncing...' : cycleMsg || 'Run Agent Cycle'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              Last 30 Days
            </button>
          </div>
        </section>

        {overview && <MetricsCards metrics={overview} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PerformanceTrends data={trends} />
          </div>
          <div>
            <AgentActivityFeed activity={activity} isLoading={loadingActivity} />
          </div>
        </div>

        {/* Priority Campaigns */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-2xl font-bold">Priority Archives</h4>
            <a href="/campaigns" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all archives <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {priorityCampaigns.map((campaign) => (
              <div key={campaign.id} className="group bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="h-40 bg-gradient-to-br from-primary/10 to-primary-container/20 flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-6xl text-primary/30">campaign</span>
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur text-primary text-[10px] font-bold uppercase rounded-md shadow-sm">
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h5 className="font-serif font-bold text-lg mb-2">{campaign.name}</h5>
                  <p className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-4">{campaign.objective}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[10px] uppercase text-stone-400 font-bold">Health Score</p>
                      <p className="text-sm font-bold text-primary">A+</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-stone-400 font-bold">ROAS</p>
                      <p className="text-sm font-bold">4.2x</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    Manage Observatory
                  </button>
                </div>
              </div>
            ))}
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
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </button>
      </div>
    </div>
  );
}
