import { useEffect, useRef } from "react";
import type { AgentActivity } from "../../types";
import { timeAgo } from "../../lib/utils";

interface Props {
  activity: AgentActivity[];
  isLoading?: boolean;
}

const AGENT_COLORS: Record<string, string> = {
  "Performance Detective": "text-primary",
  "Budget Strategist":     "text-secondary",
  "Growth Executor":       "text-tertiary",
  "System":                "text-stone-400",
};

const AGENT_ICONS: Record<string, string> = {
  "Performance Detective": "search",
  "Budget Strategist":     "payments",
  "Growth Executor":       "trending_up",
  "System":                "settings_suggest",
};

export function AgentActivityFeed({ activity, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activity]);

  return (
    <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-sm flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-serif text-xl font-bold">Agent Activity</h4>
        <div className="flex items-center gap-2 text-primary">
          {isLoading && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          <span className="material-symbols-outlined text-xl">smart_toy</span>
        </div>
      </div>

      <div className="space-y-8 relative overflow-y-auto pr-2 no-scrollbar" style={{ maxHeight: "420px" }}>
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-outline-variant/30" />
        
        {activity.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-10">
            Scanning for agent pulses...
          </p>
        ) : (
          activity.slice(0, 15).map((log) => (
            <div key={log.id} className="relative pl-10 flex flex-col gap-1 animate-fade-in group">
              <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border border-outline-variant/40 flex items-center justify-center z-10 shadow-sm group-hover:border-primary transition-all">
                <span className={`material-symbols-outlined text-[16px] ${AGENT_COLORS[log.agent_name] || 'text-primary'}`}>
                  {AGENT_ICONS[log.agent_name] || 'info'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider group-hover:text-primary transition-colors">
                {timeAgo(log.created_at)}
              </span>
              <p className="text-sm font-semibold text-on-surface leading-tight">{log.agent_name}</p>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[240px]">
                {log.message}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      
      <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all">
        View Full History
      </button>
    </div>
  );
}
