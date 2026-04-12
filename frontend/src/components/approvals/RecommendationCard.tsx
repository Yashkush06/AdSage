import { useState } from "react";
import type { Recommendation } from "../../types";
import { timeAgo } from "../../lib/utils";

interface Props {
  rec: Recommendation;
  onApprove: (id: number, notes?: string) => void;
  onReject: (id: number, notes?: string) => void;
  isLoading?: boolean;
}

const TYPE_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  PAUSE_CAMPAIGN:     { icon: "pause_circle",   label: "Pause Campaign",      color: "text-[#B4182D]",  bg: "bg-[#B4182D]/10 border-[#B4182D]/20" },
  BUDGET_INCREASE:    { icon: "trending_up",    label: "Budget Increase",     color: "text-[#FDA481]", bg: "bg-[#FDA481]/10 border-[#FDA481]/20" },
  BUDGET_DECREASE:    { icon: "trending_down",  label: "Budget Decrease",     color: "text-[#54162B]",   bg: "bg-[#54162B]/10 border-[#54162B]/20" },
  SCALE_CAMPAIGN:     { icon: "rocket_launch",  label: "Scale Campaign",      color: "text-[#FDA481]", bg: "bg-[#FDA481]/20 border-[#FDA481]/30" },
  DUPLICATE_CAMPAIGN: { icon: "content_copy",   label: "Duplicate Campaign",  color: "text-[#37415C]",   bg: "bg-[#37415C]/10 border-[#37415C]/20" },
  AUDIENCE_EXPANSION: { icon: "group_add",      label: "Audience Expansion",  color: "text-[#FDA481]", bg: "bg-[#FDA481]/10 border-[#FDA481]/20" },
  CREATIVE_REFRESH:   { icon: "auto_fix_high",  label: "Creative Refresh",    color: "text-[#FDA481]", bg: "bg-[#FDA481]/5 border-[#FDA481]/20" },
};

const PRIORITY_STYLES: Record<string, { badge: string; bar: string; glow: string }> = {
  critical: { badge: "bg-[#B4182D]/20 text-[#B4182D] border border-[#B4182D]/30",   bar: "bg-[#B4182D]",   glow: "shadow-[#B4182D]/20" },
  high:     { badge: "bg-[#54162B]/20 text-[#54162B] border border-[#54162B]/30", bar: "bg-[#54162B]", glow: "shadow-[#54162B]/10" },
  medium:   { badge: "bg-[#37415C]/20 text-[#37415C] border border-[#37415C]/30",   bar: "bg-[#37415C]",  glow: "" },
  low:      { badge: "bg-[#242E49]/20 text-[#FDA481]/40 border border-[#242E49]/30", bar: "bg-[#242E49]", glow: "" },
};

const RISK_STYLES: Record<string, { dot: string; label: string }> = {
  high:   { dot: "bg-[#B4182D]",    label: "High Risk" },
  medium: { dot: "bg-[#54162B]",  label: "Medium Risk" },
  low:    { dot: "bg-[#FDA481]",label: "Low Risk" },
};

const AGENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Performance Detective": { bg: "bg-[#FDA481]/10",    text: "text-[#FDA481]",   border: "border-[#FDA481]/20" },
  "Budget Strategist":     { bg: "bg-[#37415C]/10",    text: "text-[#37415C]", border: "border-[#37415C]/20" },
  "Growth Executor":       { bg: "bg-[#54162B]/10",   text: "text-[#54162B]", border: "border-[#54162B]/20" },
};

const AGENT_BAR: Record<string, string> = {
  "Performance Detective": "bg-[#FDA481]",
  "Budget Strategist":     "bg-[#37415C]",
  "Growth Executor":       "bg-[#54162B]",
};

function ConfidenceRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const color = score >= 80 ? "#FDA481" : score >= 60 ? "#37415C" : "#B4182D";
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
        <span className="text-[7px] font-bold text-[#FDA481]/40 uppercase tracking-tighter">AI Conf.</span>
      </div>
    </div>
  );
}

export function RecommendationCard({ rec, onApprove, onReject, isLoading }: Props) {
  const [expanded, setExpanded]   = useState(false);
  const [notes, setNotes]         = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);

  const type   = TYPE_META[rec.type] ?? { icon: "lightbulb", label: rec.type, color: "text-primary", bg: "bg-primary/5 border-primary/20" };
  const prio   = PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.low;
  const risk   = RISK_STYLES[rec.risk_level]   ?? RISK_STYLES.low;
  const agent  = AGENT_STYLES[rec.agent_name]  ?? { bg: "bg-[#242E49]", text: "text-[#FDA481]/40", border: "border-[#37415C]/20" };
  const agentBar = AGENT_BAR[rec.agent_name]   ?? "bg-[#FDA481]";

  const handleConfirm = () => {
    if (actionMode === "approve") onApprove(rec.id, notes || undefined);
    if (actionMode === "reject")  onReject(rec.id, notes || undefined);
    setActionMode(null);
    setShowNotes(false);
    setNotes("");
  };

  return (
    <div className={`bg-[#181A2F] rounded-2xl border border-[#37415C]/20 shadow-sm overflow-hidden animate-slide-up group transition-shadow hover:shadow-md ${prio.glow}`}>
      {/* Priority stripe */}
      <div className={`h-1 w-full ${prio.bar}`} />

      <div className="p-7">
        {/* ---- Top Row ---- */}
        <div className="flex justify-between items-start gap-5 mb-5">
          <div className="flex-1 space-y-2.5">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${type.bg} ${type.color}`}>
                <span className="material-symbols-outlined text-[13px]">{type.icon}</span>
                {type.label}
              </span>
              {/* Priority */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${prio.badge}`}>
                {rec.priority} priority
              </span>
              {/* Risk */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#242E49] border border-[#37415C]/20 text-[10px] font-bold uppercase tracking-widest text-[#FDA481]/50">
                <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                {risk.label}
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-white leading-tight">{rec.title}</h3>

            {/* Agent + time */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${agent.bg} ${agent.text} ${agent.border}`}>
                <span className="material-symbols-outlined text-[11px]">smart_toy</span>
                {rec.agent_name}
              </span>
              <span className="text-[#FDA481]/40 text-[10px] font-medium">•</span>
              <span className="text-[#FDA481]/40 text-[10px] font-medium">{timeAgo(rec.created_at)}</span>
            </div>
          </div>

          <ConfidenceRing score={rec.confidence_score} />
        </div>

        {/* ---- Description ---- */}
        <p className="text-[#FDA481]/50 text-sm leading-relaxed mb-5 border-l-2 border-[#37415C]/30 pl-4 italic">
          {rec.description}
        </p>

        {/* ---- Predicted Impact Chips ---- */}
        {Object.keys(rec.predicted_impact).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(rec.predicted_impact).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 px-3 py-1.5 bg-[#242E49] border border-[#37415C]/20 rounded-lg">
                <span className="material-symbols-outlined text-[#FDA481] text-[13px]">trending_up</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FDA481]/40">{k.replace(/_/g, " ")}:</span>
                <span className="text-[11px] font-bold text-[#FDA481]">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ---- Action Details (if available) ---- */}
        {Object.keys(rec.action_details).length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5 p-4 bg-[#242E49] rounded-xl border border-[#37415C]/10">
            <p className="w-full text-[9px] font-bold uppercase tracking-[0.2em] text-[#FDA481]/40 mb-1">Action Parameters</p>
            {Object.entries(rec.action_details).map(([k, v]) => (
              <div key={k} className="text-xs">
                <span className="text-[#FDA481]/40 font-medium">{k.replace(/_/g, " ")}: </span>
                <span className="font-bold text-white">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ---- Expand: Full Reasoning ---- */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FDA481] hover:underline mb-3"
        >
          <span className="material-symbols-outlined text-sm">{expanded ? "expand_less" : "expand_more"}</span>
          {expanded ? "Hide Agent Reasoning" : "View Full Agent Reasoning"}
        </button>

        {expanded && (
          <div className="mb-5 p-5 bg-[#242E49] rounded-xl border border-[#37415C]/10 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 text-[#FDA481]/50">
              <span className="material-symbols-outlined text-base text-[#FDA481]">psychology</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Internal Agent Reasoning</p>
            </div>
            <p className="text-sm text-[#FDA481]/60 leading-relaxed">{rec.reasoning || "No additional reasoning provided."}</p>

            {/* Data supporting */}
            {Object.keys(rec.data_supporting).length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#37415C]/10">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FDA481]/40 mb-2">Supporting Data</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(rec.data_supporting).slice(0, 6).map(([k, v]) => (
                    <div key={k} className="bg-[#181A2F] p-2.5 rounded-lg border border-[#37415C]/20">
                      <p className="text-[9px] text-[#FDA481]/40 font-bold uppercase tracking-widest mb-0.5">{k.replace(/_/g, " ")}</p>
                      <p className="text-sm font-bold text-white">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- Notes box (shown before confirm) ---- */}
        {showNotes && (
          <div className="mb-5 animate-fade-in">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#FDA481]/40 block mb-2">
              {actionMode === "approve" ? "Approval Note (optional)" : "Rejection Reason (optional)"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={actionMode === "approve" ? "e.g., Approved after manual ROAS check..." : "e.g., Budget constraints this week..."}
              rows={2}
              className="w-full text-sm bg-[#242E49] border border-[#37415C]/30 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#FDA481] transition-colors placeholder:text-[#FDA481]/40"
            />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  actionMode === "approve"
                    ? "bg-[#FDA481] text-[#181A2F] shadow-lg shadow-[#FDA481]/20 hover:scale-[1.02]"
                    : "bg-[#B4182D] text-white shadow-lg shadow-[#B4182D]/20 hover:scale-[1.02]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{actionMode === "approve" ? "verified" : "cancel"}</span>
                Confirm {actionMode === "approve" ? "Approval" : "Rejection"}
              </button>
              <button
                onClick={() => { setShowNotes(false); setActionMode(null); setNotes(""); }}
                className="px-5 py-3 border border-[#37415C]/30 rounded-xl text-xs font-bold uppercase tracking-widest text-[#FDA481]/50 hover:bg-[#242E49] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ---- Primary Controls ---- */}
        {!showNotes && (
          <div className="flex gap-3 border-t border-[#37415C]/10 pt-6">
            <button
              onClick={() => { setActionMode("approve"); setShowNotes(true); }}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-[#FDA481] text-[#181A2F] rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#FDA481]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              Authorize
            </button>
            <button
              onClick={() => { setActionMode("reject"); setShowNotes(true); }}
              disabled={isLoading}
              className="px-6 py-3.5 bg-[#242E49] border border-[#37415C]/30 text-[#FDA481]/60 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#B4182D]/30 hover:text-[#B4182D] hover:bg-[#B4182D]/5 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
              Dismiss
            </button>
            <button
              onClick={() => setExpanded(true)}
              title="View Details"
              className="px-4 py-3.5 bg-[#242E49] border border-[#37415C]/30 text-[#FDA481]/40 rounded-xl hover:text-[#FDA481] hover:border-[#FDA481]/30 transition-all"
            >
              <span className="material-symbols-outlined text-base">info</span>
            </button>
          </div>
        )}
      </div>

      {/* Agent color footer stripe */}
      <div className={`h-1 w-full ${agentBar}`} />
    </div>
  );
}
