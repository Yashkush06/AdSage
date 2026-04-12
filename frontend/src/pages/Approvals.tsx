import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../lib/api";
import { RecommendationCard } from "../components/approvals/RecommendationCard";
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState, useMemo } from "react";
import type { Recommendation, RecommendationPriority, RecommendationRisk } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "pending" | "history";
type SortKey = "newest" | "priority" | "confidence" | "risk";
type PriorityFilter = "all" | RecommendationPriority;
type RiskFilter = "all" | RecommendationRisk;

const PRIORITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const RISK_ORDER: Record<string, number>     = { high: 3, medium: 2, low: 1 };

// ─── Stat Tile ───────────────────────────────────────────────────────────────
function StatTile({
  icon, label, value, sub, color = "text-primary",
}: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/5 ${color}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</p>
        <p className={`text-2xl font-serif font-bold ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-stone-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── History Row ─────────────────────────────────────────────────────────────
function HistoryRow({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const approved = rec.status === "EXECUTED" || rec.status === "APPROVED" || rec.status === "AUTO_APPROVED";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div
        className="flex items-center gap-5 p-5 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status icon */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          approved
            ? "bg-emerald-50 text-emerald-600"
            : rec.status === "FAILED"
            ? "bg-red-50 text-red-600"
            : "bg-stone-100 text-stone-500"
        }`}>
          <span className="material-symbols-outlined text-xl">
            {approved ? "check_circle" : rec.status === "FAILED" ? "error" : "cancel"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h5 className="font-serif font-bold text-base text-on-surface truncate">{rec.title}</h5>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
              approved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : rec.status === "FAILED"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-stone-100 text-stone-500 border-stone-200"
            }`}>
              {rec.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-[10px] text-stone-400 font-medium">
            <span className="font-bold text-stone-500">{rec.agent_name}</span>
            {" • "}
            {rec.type.replace(/_/g, " ")}
            {" • "}
            {new Date(rec.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Confidence</p>
            <p className="text-sm font-bold text-primary">{rec.confidence_score}%</p>
          </div>
          <span className={`material-symbols-outlined text-stone-400 transition-transform text-base ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-outline-variant/10 pt-4 animate-fade-in">
          <p className="text-sm text-stone-500 leading-relaxed mb-4 italic border-l-2 border-outline-variant/30 pl-4">
            {rec.description}
          </p>
          {Object.keys(rec.predicted_impact).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(rec.predicted_impact).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-[10px]">
                  <span className="font-bold text-stone-400 uppercase tracking-widest">{k.replace(/_/g, " ")}:</span>
                  <span className="font-bold text-primary">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {rec.reasoning && (
            <p className="mt-4 text-[11px] text-stone-400 leading-relaxed">{rec.reasoning}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function Approvals() {
  const [tab, setTab]                     = useState<Tab>("pending");
  const [sortBy, setSortBy]               = useState<SortKey>("priority");
  const [filterPriority, setFilterPriority] = useState<PriorityFilter>("all");
  const [filterRisk, setFilterRisk]       = useState<RiskFilter>("all");
  const [filterAgent, setFilterAgent]     = useState<string>("all");
  const [search, setSearch]               = useState("");
  const qc = useQueryClient();

  const { data: pendingRes, isLoading } = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: () => approvalsApi.list(),
    refetchInterval: 20000,
  });

  const { data: historyRes, isLoading: loadingHistory } = useQuery({
    queryKey: ["approvals", "history"],
    queryFn: () => approvalsApi.history(),
    enabled: tab === "history",
  });

  const approve = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => approvalsApi.approve(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
  });

  const reject = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => approvalsApi.reject(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
  });

  const allPending: Recommendation[] = pendingRes?.data?.approvals || [];
  const allHistory: Recommendation[] = historyRes?.data?.history   || [];

  // Derived stats
  const criticalCount  = allPending.filter((r) => r.priority === "critical").length;
  const highConfCount  = allPending.filter((r) => r.confidence_score >= 80).length;
  const lowRiskCount   = allPending.filter((r) => r.risk_level === "low").length;
  const approvedTotal  = allHistory.filter((r) => ["EXECUTED","APPROVED","AUTO_APPROVED"].includes(r.status)).length;

  // Unique agents in pending
  const agents = useMemo(
    () => ["all", ...Array.from(new Set(allPending.map((r) => r.agent_name)))],
    [allPending]
  );

  // Filtered + sorted pending
  const pending = useMemo(() => {
    let list = [...allPending];
    if (filterPriority !== "all") list = list.filter((r) => r.priority === filterPriority);
    if (filterRisk     !== "all") list = list.filter((r) => r.risk_level === filterRisk);
    if (filterAgent    !== "all") list = list.filter((r) => r.agent_name === filterAgent);
    if (search.trim())            list = list.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      if (sortBy === "priority")   return (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
      if (sortBy === "confidence") return b.confidence_score - a.confidence_score;
      if (sortBy === "risk")       return (RISK_ORDER[b.risk_level] ?? 0) - (RISK_ORDER[a.risk_level] ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [allPending, filterPriority, filterRisk, filterAgent, search, sortBy]);

  if (isLoading && tab === "pending") return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Approval Center" subtitle="Human Authorization Protocol" />

      <main className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in w-full">

        {/* ── Hero Title ── */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined text-base">pending_actions</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Agent Queue</span>
            </div>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Approval Center</h2>
            <p className="text-stone-500 font-medium text-sm">Review, interrogate, and authorize AI-proposed campaign changes.</p>
          </div>

          {/* Tab switcher */}
          <div className="bg-surface-container-low p-1.5 rounded-2xl flex gap-1 shadow-sm border border-outline-variant/10">
            {(["pending", "history"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  tab === t ? "bg-white text-primary shadow-sm" : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {t === "pending" ? `Pending (${allPending.length})` : "History"}
              </button>
            ))}
          </div>
        </section>

        {/* ── Stats Strip (always visible) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile icon="warning"      label="Critical"       value={criticalCount}  sub="Needs immediate review" color="text-red-600" />
          <StatTile icon="verified"     label="High Confidence" value={highConfCount}  sub="≥ 80% AI confidence"  color="text-primary" />
          <StatTile icon="verified_user" label="Low Risk"        value={lowRiskCount}   sub="Safe to approve"       color="text-emerald-600" />
          <StatTile icon="history"      label="Approved Total"  value={approvedTotal}  sub="Past decisions"        color="text-stone-600" />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            PENDING TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "pending" && (
          <>
            {/* Filters bar */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 space-y-4 shadow-sm">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recommendations…"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-stone-400"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Sort:</span>
                  <div className="flex gap-1 p-0.5 bg-surface-container-high rounded-lg">
                    {(["priority","confidence","risk","newest"] as SortKey[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                          sortBy === s ? "bg-white text-primary shadow-sm" : "text-stone-400 hover:text-stone-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Priority:</span>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as PriorityFilter)}
                    className="text-[11px] font-bold bg-surface-container-high border-none rounded-lg px-3 py-1.5 focus:outline-none text-stone-600"
                  >
                    {["all","critical","high","medium","low"].map((p) => (
                      <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Risk filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Risk:</span>
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value as RiskFilter)}
                    className="text-[11px] font-bold bg-surface-container-high border-none rounded-lg px-3 py-1.5 focus:outline-none text-stone-600"
                  >
                    {["all","high","medium","low"].map((r) => (
                      <option key={r} value={r}>{r === "all" ? "All Risks" : r.charAt(0).toUpperCase() + r.slice(1) + " Risk"}</option>
                    ))}
                  </select>
                </div>

                {/* Agent filter */}
                {agents.length > 2 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Agent:</span>
                    <select
                      value={filterAgent}
                      onChange={(e) => setFilterAgent(e.target.value)}
                      className="text-[11px] font-bold bg-surface-container-high border-none rounded-lg px-3 py-1.5 focus:outline-none text-stone-600"
                    >
                      {agents.map((a) => (
                        <option key={a} value={a}>{a === "all" ? "All Agents" : a}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Result count */}
                <span className="ml-auto text-[10px] font-medium text-stone-400 flex items-center">
                  {pending.length} of {allPending.length} shown
                </span>
              </div>
            </div>

            {/* Cards */}
            {pending.length === 0 ? (
              <div className="bg-surface-container-low rounded-3xl p-20 text-center border-2 border-dashed border-outline-variant/20">
                <span className="material-symbols-outlined text-6xl text-stone-300 mb-6 block">task_alt</span>
                <h3 className="font-serif text-2xl font-bold text-on-surface mb-2">
                  {allPending.length === 0 ? "Clear Skies" : "No Matches"}
                </h3>
                <p className="text-stone-500 text-sm max-w-xs mx-auto">
                  {allPending.length === 0
                    ? "No pending recommendations. Agents are monitoring the ecosystem."
                    : "Try adjusting your filters or search query."}
                </p>
                {allPending.length > 0 && (
                  <button
                    onClick={() => { setFilterPriority("all"); setFilterRisk("all"); setFilterAgent("all"); setSearch(""); }}
                    className="mt-8 px-6 py-2 bg-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-outline-variant/30 hover:shadow-md transition-shadow"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {pending.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    onApprove={(id, notes) => approve.mutate({ id, notes })}
                    onReject={(id, notes)  => reject.mutate({ id, notes })}
                    isLoading={approve.isPending || reject.isPending}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            HISTORY TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {tab === "history" && (
          <>
            {/* Summary strip */}
            {allHistory.length > 0 && (
              <div className="flex flex-wrap gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
                {[
                  { label: "Approved", count: allHistory.filter((r) => ["EXECUTED","APPROVED","AUTO_APPROVED"].includes(r.status)).length, color: "text-emerald-600" },
                  { label: "Rejected", count: allHistory.filter((r) => r.status === "REJECTED").length, color: "text-red-600" },
                  { label: "Failed",   count: allHistory.filter((r) => r.status === "FAILED").length,   color: "text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <p className={`text-2xl font-serif font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{s.label}</p>
                  </div>
                ))}
                <div className="ml-auto text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total Decisions</p>
                  <p className="text-2xl font-serif font-bold text-on-surface">{allHistory.length}</p>
                </div>
              </div>
            )}

            {loadingHistory ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : allHistory.length === 0 ? (
              <p className="text-stone-400 text-center py-20 text-sm italic">Decision archive is empty.</p>
            ) : (
              <div className="space-y-3">
                {allHistory.map((rec) => (
                  <HistoryRow key={rec.id} rec={rec} />
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
