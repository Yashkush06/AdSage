import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../lib/api";
<<<<<<< HEAD
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { AgentActivity } from "../types";
import { timeAgo } from "../lib/utils";
import { Reveal, Revealstagger } from "../components/shared/Reveal";

const AGENT_COLORS: Record<string, string> = {
  "Performance Detective": "text-[#FDA481]",
  "Budget Strategist":     "text-[#B4182D]",
  "Growth Executor":       "text-[#FDA481]/70",
  "System":                "text-[#FDA481]/40",
};

const AGENT_ICONS: Record<string, string> = {
  "Performance Detective": "search",
  "Budget Strategist":     "payments",
  "Growth Executor":       "trending_up",
  "System":                "settings_suggest",
};

export function Activity() {
  const [filter, setFilter] = useState<string>("ALL");

  const { data: activityRes, isLoading } = useQuery({
    queryKey: ["full-activity"],
    queryFn: () => analyticsApi.agentActivity(100),
    refetchInterval: 10000,
  });

  const allActivity: AgentActivity[] = activityRes?.data?.activity || [];
  const filteredActivity = filter === "ALL" 
    ? allActivity 
    : allActivity.filter(a => a.agent_name === filter);

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Header title="Agent Pulse Log" subtitle="Real-time Synchronization Stream" />

      <main className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in w-full">
        {/* Header & Filters */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-white">System Activity</h2>
            <p className="text-[#FDA481]/50 font-medium italic">Observing {allActivity.length} neural pulses in current cycle.</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#242E49] border border-[#37415C]/40 rounded-xl px-4 py-2.5 text-xs font-bold text-[#FDA481] outline-none focus:ring-2 focus:ring-[#FDA481]/20 transition-all cursor-pointer"
            >
              <option value="ALL">All Agents</option>
              <option value="Performance Detective">Performance Detective</option>
              <option value="Budget Strategist">Budget Strategist</option>
              <option value="Growth Executor">Growth Executor</option>
            </select>
          </div>
        </section>

        {/* Activity Stream */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-[#37415C]/40" />

          <Revealstagger>
            <div className="space-y-12">
              {filteredActivity.length === 0 ? (
                <div className="text-center py-20 bg-[#242E49]/50 rounded-3xl border border-dashed border-[#37415C]/40">
                  <p className="text-[#FDA481]/50 font-medium">No activity recovered from the current filter.</p>
                </div>
              ) : (
                filteredActivity.map((log, i) => (
                  <Reveal key={log.id} delay={i * 0.05} y={30} blur={false}>
                    <div className="relative pl-16 group">
                      {/* Icon Node */}
                      <div className="absolute left-0 top-0 w-12 h-12 rounded-none bg-black border border-white/20 flex items-center justify-center z-10 shadow-lg group-hover:border-white group-hover:scale-110 transition-all duration-300 hover-glitch">
                        <span className={`material-symbols-outlined text-2xl ${AGENT_COLORS[log.agent_name] || 'text-white'}`}>
                          {AGENT_ICONS[log.agent_name] || 'info'}
                        </span>
                      </div>

                      {/* Content Card */}
                      <div className="p-4 rounded-none border bg-white/5 border-white/10 group-hover:bg-white/10 transition-all duration-500">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            [{log.agent_name}] {timeAgo(log.created_at)}
                          </span>
                          <span className="material-symbols-outlined text-white/20 text-sm">bolt</span>
                        </div>
                        <p className="text-sm font-bold text-white/80 leading-relaxed uppercase tracking-tighter italic">
                          {log.message}
                        </p>
                        
                        <div className="mt-6 pt-4 border-t border-[#37415C]/10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-4">
                            <button className="text-[10px] font-bold uppercase text-[#FDA481]/30 hover:text-[#FDA481]">Inspect Node</button>
                            <button className="text-[10px] font-bold uppercase text-[#FDA481]/30 hover:text-[#FDA481]">View Metadata</button>
                          </div>
                          <span className="material-symbols-outlined text-[#FDA481]/20 text-sm">terminal</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))
              )}
            </div>
          </Revealstagger>
        </div>

        {/* Floating Pulse Indicator */}
        <div className="fixed bottom-12 right-12 z-50 flex items-center gap-4 bg-[#181A2F]/80 backdrop-blur border border-[#37415C]/20 px-6 py-3 rounded-full shadow-2xl animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#FDA481] animate-ping" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDA481]">Live Pulse Active</span>
        </div>
      </main>
=======
import { AgentActivityFeed } from "../components/dashboard/AgentActivityFeed";

export function Activity() {
  const { data: activityRes, isLoading } = useQuery({ 
    queryKey: ["activity", "full"], 
    queryFn: () => analyticsApi.agentActivity(100), 
    refetchInterval: 15000 
  });

  const activity = activityRes?.data?.activity || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-blur-in pb-32">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Agent Activity Log</h1>
        <p style={{ color: "rgba(255,255,255,0.40)" }}>
          Real-time logs, actions, and insights across all your active AI agents.
        </p>
      </div>
      
      <div className="bg-[#181A2F]/50 rounded-2xl p-2 border border-[#37415C]/20 shadow-lg">
        <AgentActivityFeed activity={activity} isLoading={isLoading} />
      </div>
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
    </div>
  );
}
