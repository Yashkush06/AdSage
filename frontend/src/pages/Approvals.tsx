import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../lib/api";
import { RecommendationCard } from "../components/approvals/RecommendationCard";
import { PageLoader } from "../components/shared/LoadingStates";
import { CheckSquare, History } from "lucide-react";
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
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
          Approval Center
        </h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Human-in-the-loop decisions for AI agent recommendations
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", padding: 4, background: "var(--bg-surface)", borderRadius: 10, width: "fit-content" }}>
        {[
          { id: "pending", label: `Pending (${pending.length})`, icon: <CheckSquare size={14} /> },
          { id: "history", label: "History",                      icon: <History size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              padding: "0.5rem 1rem", borderRadius: 8, border: "none",
              background: tab === t.id ? "var(--bg-elevated)" : "transparent",
              color: tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: "0.85rem", cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Pending */}
      {tab === "pending" && (
        pending.length === 0 ? (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
            <CheckSquare size={40} color="var(--text-faint)" style={{ marginBottom: "0.75rem" }} />
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              No pending recommendations. Run an agent cycle from the dashboard.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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

      {/* History */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {history.map((rec) => (
            <div key={rec.id} className="glass-card animate-fade-in" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {rec.title}
                </p>
                <span className={`badge ${
                  rec.status === "EXECUTED" ? "badge-green" :
                  rec.status === "REJECTED" ? "badge-red" : "badge-blue"
                }`}>
                  {rec.status}
                </span>
              </div>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {rec.agent_name} · {new Date(rec.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {history.length === 0 && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
              No history yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
