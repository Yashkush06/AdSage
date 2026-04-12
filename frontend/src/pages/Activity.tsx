import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../lib/api";
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
    </div>
  );
}
