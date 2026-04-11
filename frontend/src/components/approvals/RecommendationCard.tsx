import { useState } from "react";
import type { Recommendation } from "../../types";
import { timeAgo } from "../../lib/utils";

interface Props {
  rec: Recommendation;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isLoading?: boolean;
}



const AGENT_COLORS: Record<string, string> = {
  "Performance Detective": "text-primary",
  "Budget Strategist":     "text-secondary",
  "Growth Executor":       "text-tertiary",
};

export function RecommendationCard({ rec, onApprove, onReject, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden animate-slide-up group">
      <div className="p-8">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-6 mb-6">
          <div className="flex-1 space-y-3">
             <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md ${
                  rec.priority === 'high' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  {rec.priority} PRIORITY
                </span>
                <span className="px-2 py-0.5 bg-surface-container-high text-stone-500 text-[9px] font-bold uppercase tracking-widest rounded-md">
                   Risk: {rec.risk_level}
                </span>
             </div>
             <h3 className="font-serif text-2xl font-bold text-on-surface leading-tight">
               {rec.title}
             </h3>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <span className={`font-black ${AGENT_COLORS[rec.agent_name] || "text-primary"}`}>
                   {rec.agent_name}
                </span>
                <span>•</span>
                <span>{timeAgo(rec.created_at)}</span>
             </div>
          </div>

          {/* Confidence Circle */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
                <circle 
                  cx="32" cy="32" r="28" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  className="text-outline-variant/20"
                />
                <circle 
                  cx="32" cy="32" r="28" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - rec.confidence_score / 100)}`}
                  className="text-primary"
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-primary">{rec.confidence_score}%</span>
                <span className="text-[7px] font-bold text-stone-400 uppercase tracking-tighter">Match</span>
             </div>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-stone-500 text-sm leading-relaxed mb-6 italic">
          "{rec.description}"
        </p>

        {/* Detail Toggle */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline mb-4"
        >
          <span className="material-symbols-outlined text-sm">
            {expanded ? "expand_less" : "expand_more"}
          </span>
          {expanded ? "Hide Rationale" : "Full Agent Reasoning"}
        </button>

        {expanded && (
          <div className="p-6 bg-black/10 rounded-xl border border-outline-variant/10 space-y-6 mb-6 animate-fade-in">
             <div>
                <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-2">Internal Logic</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {rec.reasoning}
                </p>
             </div>
             {Object.keys(rec.predicted_impact).length > 0 && (
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10">
                  {Object.entries(rec.predicted_impact).map(([k, v]) => (
                    <div key={k}>
                       <p className="text-[9px] uppercase text-stone-400 font-bold mb-1">{k.replace(/_/g, ' ')}</p>
                       <p className="text-sm font-bold text-primary">{String(v)}</p>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {/* Control Surface */}
        <div className="flex gap-4 border-t border-outline-variant/10 pt-8">
           <button 
             onClick={() => onApprove(rec.id)}
             disabled={isLoading}
             className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
           >
             <span className="material-symbols-outlined text-sm">verified</span>
             Authorize Change
           </button>
           <button 
             onClick={() => onReject(rec.id)}
             disabled={isLoading}
             className="px-6 py-4 bg-error/10 text-error rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-error/20 transition-colors disabled:opacity-50"
           >
             Dismiss
           </button>
        </div>
      </div>
      
      {/* Decorative Agent Stripe */}
      <div className={`h-1.5 w-full ${rec.agent_name === 'Performance Detective' ? 'bg-primary' : rec.agent_name === 'Budget Strategist' ? 'bg-secondary' : 'bg-tertiary'}`}></div>
    </div>
  );
}
