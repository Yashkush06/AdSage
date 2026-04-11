import { useQuery } from "@tanstack/react-query";
import { campaignsApi } from "../lib/api";
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { Campaign, CampaignInsights } from "../types";
import { formatCurrency, formatRoas } from "../lib/utils";

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
    if (status === "ACTIVE") return "bg-secondary-container/40 text-on-secondary-container";
    if (status === "PAUSED") return "bg-surface-container-highest text-stone-500";
    return "bg-error-container/40 text-on-error-container";
  };

  return (
    <tr
      onClick={() => onSelect(campaign)}
      className={`group hover:bg-surface-container-low/30 transition-colors cursor-pointer ${selected ? "bg-secondary-container/10" : ""}`}
    >
      <td className="px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">{campaign.name}</p>
            <p className="text-[10px] text-stone-400 tracking-wide uppercase">{campaign.objective}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 text-center">
        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${getStatusClass(campaign.status)}`}>
          {campaign.status}
        </span>
      </td>
      <td className="px-6 py-6">
        <p className="text-sm text-on-surface">{ins ? formatCurrency(ins.spend) : "—"}</p>
        <p className="text-[10px] text-stone-400">Total Spend</p>
      </td>
      <td className="px-6 py-6">
        <p className={`text-sm font-semibold ${ins && ins.roas >= 3 ? 'text-primary' : 'text-stone-400'}`}>
          {ins ? formatRoas(ins.roas) : "—"}
        </p>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {ins?.trend === "improving" ? "trending_up" : ins?.trend === "declining" ? "trending_down" : "horizontal_rule"}
          </span>
          <span className="text-[10px] font-bold">
            {ins?.trend === "improving" ? "+18%" : ins?.trend === "declining" ? "-8%" : "0%"}
          </span>
        </div>
      </td>
      <td className="px-6 py-6 text-right">
        <button className="p-2 text-stone-400 hover:text-primary transition-colors">
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
    <div className="flex flex-col min-h-screen">
      <Header title="Campaign Archives" subtitle="Inventory of Marketing Efforts" />
      
      <main className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in w-full">
        {/* Bento Stats Header */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary-container/10 transition-colors duration-500"></div>
            <div className="relative z-10">
              <span className="label-md text-primary font-bold tracking-widest text-[10px] uppercase mb-4 block">Archive Efficiency</span>
              <h3 className="display-sm text-4xl font-serif text-on-surface mb-2">3.4x ROAS</h3>
              <p className="text-stone-500 body-md max-w-md">Your active campaigns are outperforming the seasonal benchmark by 24%. Recommended: Scale active assets.</p>
              <div className="mt-8 flex gap-4">
                <button className="text-primary text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  Explore Insights <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-6 lg:col-span-2 bg-secondary-container/30 rounded-xl p-6 border border-outline-variant/10 flex flex-col justify-between">
            <span className="material-symbols-outlined text-primary mb-4">payments</span>
            <div>
              <p className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">Total Spend</p>
              <p className="text-xl font-serif text-on-surface">$12,480</p>
            </div>
          </div>
          <div className="col-span-6 lg:col-span-3 bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 relative">
            <div className="flex items-start justify-between mb-8">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              <div className="px-2 py-1 bg-secondary-container rounded-full text-[10px] text-on-secondary-container font-bold">+12%</div>
            </div>
            <div>
              <p className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">Conversion Growth</p>
              <p className="text-xl font-serif text-on-surface">Across 12 Active</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="headline-md text-2xl font-serif text-on-surface">Active Archives</h2>
            <p className="text-sm text-stone-500">Managing {campaigns.length} campaigns across current regions.</p>
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-surface-container-low rounded-lg text-xs font-medium px-4 py-2 border-none outline-none focus:ring-1 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ACTIVE">Status: Active</option>
              <option value="PAUSED">Status: Paused</option>
            </select>
            <button className="px-4 py-2 bg-surface-container-low rounded-lg text-xs font-medium text-on-surface border border-outline-variant/20 flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-stone-400 font-semibold">Campaign Name</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-stone-400 font-semibold text-center">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-stone-400 font-semibold">Spend</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-stone-400 font-semibold">ROAS</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-stone-400 font-semibold">Trend</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.1em] text-stone-400 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
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
          <div className="px-6 py-4 bg-surface-container-low/20 flex justify-between items-center">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Showing {campaigns.length} campaigns</p>
            <div className="flex gap-4">
              <button className="text-stone-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="text-stone-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
