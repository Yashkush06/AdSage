import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "../lib/api";
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { Campaign, CampaignInsights } from "../types";
import { formatCurrency, formatRoas } from "../lib/utils";
import { Reveal, Revealstagger } from "../components/shared/Reveal";

function CampaignRow({ campaign, onSelect, selected }: {
  campaign: Campaign;
  onSelect: (c: Campaign) => void;
  selected: boolean;
}) {
  const { data: insRes } = useQuery({
    queryKey: ["insights", campaign.id],
    queryFn: () => campaignsApi.insights(campaign.id, 30),
  });
  const ins: CampaignInsights | undefined = insRes?.data?.insights;

  const getStatusClass = (status: string) => {
    if (status === "ACTIVE") return "text-[#00F0FF] border border-[#00F0FF]/20 bg-[#00F0FF]/5";
    if (status === "PAUSED") return "text-white/20 border border-white/10 bg-white/5";
    return "text-[#FF0032] border border-[#FF0032]/20 bg-[#FF0032]/5";
  };

  return (
    <tr
      onClick={() => onSelect(campaign)}
      className={`group hover:bg-[#FF0032]/5 transition-colors cursor-pointer border-b border-white/5 ${selected ? "bg-[#FF0032]/10" : ""}`}
    >
      <td className="px-6 py-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-none bg-[#121214] flex items-center justify-center border border-white/10 shadow-[inner_0_0_10px_rgba(0,0,0,0.5)]">
            <span className="material-symbols-outlined text-[#FF0032] text-2xl shadow-[0_0_10px_rgba(255,0,50,0.3)]">campaign</span>
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase italic tracking-tighter">{campaign.name}</p>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-1 italic">{campaign.objective}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 text-center">
        <span className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-none tracking-[0.2em] italic ${getStatusClass(campaign.status)}`}>
          {campaign.status}
        </span>
      </td>
      <td className="px-6 py-6 font-mono">
        <p className="text-sm font-black text-white">{ins ? formatCurrency(ins.spend) : "—"}</p>
        <p className="text-[9px] text-[#00F0FF]/40 font-black uppercase tracking-widest mt-1">Velocity</p>
      </td>
      <td className="px-6 py-6">
        <p className={`text-sm font-black italic tracking-tighter ${ins && ins.roas >= 3 ? 'text-[#00F0FF]' : 'text-white/40'}`}>
          {ins ? formatRoas(ins.roas) : "—"}
        </p>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-lg ${ins?.trend === "improving" ? "text-[#00F0FF]" : ins?.trend === "declining" ? "text-[#FF0032]" : "text-white/20"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {ins?.trend === "improving" ? "trending_up" : ins?.trend === "declining" ? "trending_down" : "horizontal_rule"}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${ins?.trend === "improving" ? "text-[#00F0FF]" : ins?.trend === "declining" ? "text-[#FF0032]" : "text-white/20"}`}>
            {ins?.trend === "improving" ? "Optimum" : ins?.trend === "declining" ? "Warning" : "Neutral"}
          </span>
        </div>
      </td>
      <td className="px-6 py-6 text-right">
        <button className="p-2 text-white/20 hover:text-[#FF0032] transition-colors rounded-none border border-white/5 hover:border-[#FF0032]/30">
          <span className="material-symbols-outlined text-xl">more_horiz</span>
        </button>
      </td>
    </tr>
  );
}

export function Campaigns() {
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", statusFilter],
    queryFn: () => campaignsApi.list(statusFilter),
  });

  const campaigns: Campaign[] = data?.data?.campaigns || [];

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Header title="Campaign Archives" subtitle="Inventory of Marketing Efforts" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in w-full">
        <Revealstagger delay={0.1}>
          <Reveal y={40} delay={0.2}>
            {/* Bento Stats Header */}
            <div className="grid grid-cols-12 gap-8 mb-16">
              <div className="col-span-12 lg:col-span-8 bg-[#121214] rounded-none p-12 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF0032]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#FF0032]/10 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase text-[#00F0FF] tracking-[.5em] mb-4 block italic">Archive Efficiency</span>
                  <h3 className="text-6xl font-serif font-black text-white italic mb-2 uppercase tracking-tighter leading-none shadow-[0_0_20px_rgba(0,0,0,0.5)]">3.4x Average Pulse</h3>
                  <p className="text-white/40 text-[11px] font-black uppercase tracking-[.2em] max-w-lg mt-6 leading-relaxed">Active assets outperforming seasonal benchmarks. Sync level: Optimal. Scale protocols active.</p>
                  <div className="mt-10 flex gap-4">
                    <button className="px-8 py-3 bg-[#FF0032] text-white text-[10px] font-black uppercase tracking-[.4em] italic rounded-none shadow-[0_0_30px_rgba(255,0,50,0.3)] hover-glitch transition-all flex items-center gap-3">
                      Initiate Insights <span className="material-symbols-outlined text-sm">bolt</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-8">
                <div className="bg-[#121214] rounded-none p-8 border border-white/5 flex flex-col justify-between relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-[#FF0032]">payments</span>
                  </div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-[.5em] italic">Cumulative Velocity</p>
                  <div>
                    <p className="text-4xl font-serif font-black text-white italic tracking-tighter">₹12,480</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-8 h-[2px] bg-[#FF0032]/40"></span>
                        <p className="text-[10px] font-black uppercase text-[#FF0032] tracking-widest italic">Live Flux</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121214] rounded-none p-8 border border-white/5 flex flex-col justify-between relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-[#00F0FF]">trending_up</span>
                  </div>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-[.5em] italic">Conversion Flux</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-serif font-black text-white italic tracking-tighter">+12% Area</p>
                      <p className="text-[10px] font-black uppercase text-[#00F0FF] tracking-widest italic mt-2">Improving Frequency</p>
                    </div>
                    <div className="h-12 w-24 bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center">
                        <span className="text-[10px] font-black text-[#00F0FF] italic tracking-widest">STABLE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            {/* Control Cluster */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8 mb-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">Active Archives</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Managing {campaigns.length} Neural Nodes across regions.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative group">
                    <select 
                      className="bg-[#121214] text-white/60 text-[10px] font-black uppercase tracking-[0.3em] pl-6 pr-12 py-4 border border-white/10 outline-none focus:border-[#FF0032] transition-all rounded-none appearance-none italic shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ACTIVE">Status: Operational</option>
                      <option value="PAUSED">Status: Standby</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-sm">stat_0</span>
                </div>
                <button className="px-6 py-4 bg-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 hover:text-white hover:bg-white/10 transition-all rounded-none italic flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">download</span>
                  Export Dump
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            {/* Data Reservoir Table */}
            <div className="bg-[#0A0A0C] rounded-none border border-white/5 shadow-2xl overflow-hidden mb-12 relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF0032]/40 to-transparent"></div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.5em] text-white/30 font-black italic">Archive Identifier</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.5em] text-white/30 font-black italic text-center">Protocol Status</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.5em] text-white/30 font-black italic">Velocity</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.5em] text-white/30 font-black italic">Pulse Index</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.5em] text-white/30 font-black italic">Flux Trend</th>
                    <th className="px-8 py-6 text-[9px] uppercase tracking-[0.5em] text-white/30 font-black italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((c) => (
                    <CampaignRow
                      key={c.id}
                      campaign={c}
                      onSelect={setSelected}
                      selected={selected?.id === c.id}
                    />
                  ))}
                </tbody>
              </table>
              
              {/* Footer Navigation */}
              <div className="px-8 py-6 bg-white/5 flex justify-between items-center border-t border-white/5">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-black italic">
                    Reservoir Size: {campaigns.length} Entities Synchronized
                </p>
                <div className="flex gap-6">
                  <button className="p-2 text-white/20 hover:text-[#00F0FF] transition-all flex items-center gap-2 group">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Rewind</span>
                     <span className="material-symbols-outlined text-xl">west</span>
                  </button>
                  <button className="p-2 text-white/20 hover:text-[#FF0032] transition-all flex items-center gap-2 group">
                     <span className="material-symbols-outlined text-xl">east</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Fast Fwd</span>
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </Revealstagger>
      </main>
    </div>
  );
}
