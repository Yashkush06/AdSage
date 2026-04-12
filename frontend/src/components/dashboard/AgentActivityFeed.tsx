import { useEffect, useRef } from "react";
import type { AgentActivity } from "../../types";
import { timeAgo } from "../../lib/utils";

interface Props {
  activity: AgentActivity[];
  isLoading?: boolean;
}

interface AgentConfig {
  icon: string;
  color: string;
  bg: string;
  glow: string;
  label: string;
}

const AGENT_CONFIG: Record<string, AgentConfig> = {
  "Performance Detective": {
    icon: "search",
    color: "text-[#00F0FF]",
    bg: "bg-[#00F0FF]/10",
    glow: "shadow-[0_0_12px_rgba(0,240,255,0.25)]",
    label: "Analysing",
  },
  "Budget Strategist": {
    icon: "payments",
    color: "text-[#FF0032]",
    bg: "bg-[#FF0032]/10",
    glow: "shadow-[0_0_12px_rgba(255,0,50,0.25)]",
    label: "Optimizing",
  },
  "Growth Executor": {
    icon: "trending_up",
    color: "text-[#00FF94]",
    bg: "bg-[#00FF94]/10",
    glow: "shadow-[0_0_12px_rgba(0,255,148,0.25)]",
    label: "Executing",
  },
  "Creative Analyst": {
    icon: "auto_awesome",
    color: "text-[#FDA481]",
    bg: "bg-[#FDA481]/10",
    glow: "shadow-[0_0_12px_rgba(253,164,129,0.25)]",
    label: "Creating",
  },
  "System": {
    icon: "settings_suggest",
    color: "text-white/30",
    bg: "bg-white/5",
    glow: "",
    label: "System",
  },
};

const DEFAULT_CONFIG: AgentConfig = {
  icon: "info",
  color: "text-[#FDA481]",
  bg: "bg-[#FDA481]/10",
  glow: "shadow-[0_0_12px_rgba(253,164,129,0.2)]",
  label: "Active",
};

function isRecent(dateStr: string): boolean {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 60_000 * 10; // within last 10 min
  } catch {
    return false;
  }
}

function getStatusFromMessage(msg: string): { label: string; color: string } {
  const lower = msg.toLowerCase();
  if (lower.includes("complete") || lower.includes("done") || lower.includes("success"))
    return { label: "DONE", color: "text-[#00FF94] bg-[#00FF94]/10 border-[#00FF94]/20" };
  if (lower.includes("error") || lower.includes("fail") || lower.includes("0 "))
    return { label: "WARN", color: "text-[#FF0032] bg-[#FF0032]/10 border-[#FF0032]/20" };
  if (lower.includes("scanning") || lower.includes("analysing") || lower.includes("checking"))
    return { label: "LIVE", color: "text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/20" };
  return { label: "OK", color: "text-[#FDA481] bg-[#FDA481]/10 border-[#FDA481]/20" };
}

export function AgentActivityFeed({ activity, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activity]);

  return (
    <div className="bg-[#0A0A0C] rounded-2xl border border-white/5 flex flex-col overflow-hidden relative">
      {/* Ambient glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FDA481]/3 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FDA481]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#FDA481] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <div>
            <h4 className="font-black text-white text-sm uppercase tracking-[0.15em] italic">Agent Activity</h4>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
              {activity.length} events logged
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF94]/5 border border-[#00FF94]/20 rounded-full">
          <span className={`w-1.5 h-1.5 rounded-full bg-[#00FF94] ${isLoading ? "animate-ping" : "animate-pulse"}`} />
          <span className="text-[9px] font-black text-[#00FF94] uppercase tracking-widest">
            {isLoading ? "Syncing" : "Live"}
          </span>
        </div>
      </div>

      {/* Feed */}
      <div className="overflow-y-auto no-scrollbar flex-1" style={{ maxHeight: "420px" }}>
        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white/10">hub</span>
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">
              Scanning for agent pulses...
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {activity.slice(0, 15).map((log, idx) => {
              const cfg = AGENT_CONFIG[log.agent_name] ?? DEFAULT_CONFIG;
              const status = getStatusFromMessage(log.message);
              const live = isRecent(log.created_at);

              return (
                <div
                  key={log.id}
                  className="group flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all duration-200 cursor-default"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Agent avatar */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} ${cfg.glow} flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform`}>
                    <span className={`material-symbols-outlined text-[17px] ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {cfg.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-[11px] font-black uppercase tracking-[0.1em] ${cfg.color} truncate`}>
                        {log.agent_name}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {live && (
                          <span className="w-1 h-1 rounded-full bg-[#00FF94] animate-pulse" />
                        )}
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed font-medium group-hover:text-white/80 transition-colors line-clamp-2">
                      {log.message}
                    </p>

                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-wider mt-1.5 group-hover:text-white/40 transition-colors">
                      {timeAgo(log.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 border-t border-white/5">
        <button className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-[#FDA481] border border-[#FDA481]/15 hover:border-[#FDA481]/40 hover:bg-[#FDA481]/5 hover:shadow-[0_0_20px_rgba(253,164,129,0.1)] transition-all duration-300 flex items-center justify-center gap-2 italic">
          <span className="material-symbols-outlined text-[14px]">history</span>
          View Full History
        </button>
      </div>
    </div>
  );
}
