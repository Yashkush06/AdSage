import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../lib/api";
import { RecommendationCard } from "../components/approvals/RecommendationCard";
import { PageLoader } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";
import { useState } from "react";
import type { Recommendation } from "../types";

export function Approvals() {
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const qc = useQueryClient();

  const { data: pendingRes, isLoading } = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: () => approvalsApi.list(),
    refetchInterval: 20000,
  });

  const { data: historyRes } = useQuery({
    queryKey: ["approvals", "history"],
    queryFn: () => approvalsApi.history(),
    enabled: tab === "history",
  });

  const approve = useMutation({
    mutationFn: (id: number) => approvalsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
  });

  const reject = useMutation({
    mutationFn: (id: number) => approvalsApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
  });

  const pending: Recommendation[] = pendingRes?.data?.approvals || [];
  const history: Recommendation[] = historyRes?.data?.history || [];

  if (isLoading && tab === "pending") return <PageLoader />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Approval Center" subtitle="Human Authorization Protocol" />
      
      <main className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in w-full">
        {/* Title & Stats */}
        <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Queue</h2>
            <p className="text-stone-500 font-medium">Authorizing agent-proposed ecosystem adjustments.</p>
          </div>
          <div className="bg-surface-container-low p-1.5 rounded-2xl flex gap-1 shadow-sm border border-outline-variant/10">
            <button
              onClick={() => setTab("pending")}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                tab === "pending" ? "bg-primary text-white shadow-sm" : "text-stone-500 hover:text-stone-300"
              }`}
            >
              Pending ({pending.length})
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                tab === "history" ? "bg-primary text-white shadow-sm" : "text-stone-500 hover:text-stone-300"
              }`}
            >
              History
            </button>
          </div>
        </section>

        {/* Pending Workflow */}
        {tab === "pending" && (
          pending.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-20 text-center border-2 border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">task_alt</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface mb-2">Clear Skies</h3>
              <p className="text-stone-500 text-sm max-w-xs mx-auto">No pending adjustments required. Our agents are monitoring the ecosystem.</p>
              <button className="mt-8 px-6 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/20 hover:shadow-lg transition-all shadow-primary/10">
                Refresh Protocol
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {pending.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  onApprove={(id) => approve.mutate(id)}
                  onReject={(id) => reject.mutate(id)}
                  isLoading={approve.isPending || reject.isPending}
                />
              ))}
            </div>
          )
        )}

        {/* History Workflow */}
        {tab === "history" && (
          <div className="space-y-4">
            {history.map((rec) => (
              <div key={rec.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex justify-between items-center group animate-fade-in">
                 <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      rec.status === 'EXECUTED' ? 'bg-secondary-container/30 text-primary' : 'bg-error-container/20 text-error'
                    }`}>
                       <span className="material-symbols-outlined text-xl">
                          {rec.status === 'EXECUTED' ? 'check_circle' : 'cancel'}
                       </span>
                    </div>
                    <div>
                       <h5 className="font-serif font-bold text-lg">{rec.title}</h5>
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                          {rec.agent_name} • {new Date(rec.created_at).toLocaleDateString()}
                       </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      rec.status === 'EXECUTED' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                    }`}>
                       {rec.status}
                    </span>
                 </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-stone-400 text-center py-20 text-sm italic">Archive log is empty.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
