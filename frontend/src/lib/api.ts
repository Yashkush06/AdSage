import axios from "axios";

// Vite proxy routes /api and /ws to localhost:8000
// No auth headers needed — backend uses hardcoded user_id=1
const baseURL = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL });

// VERY IMPORTANT FALLBACK FOR VERCEL DEMO (Mock Data Interceptor)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.warn("[AdSage Demo Mode] Backend unavailable, injecting mock data for:", error.config.url);
    const url = error.config.url || "";
    let data: any = { success: true };

    if (url.includes("/api/auth/me")) {
      data = { id: 1, email: "demo@adsage.com", business_name: "Verse Demo" };
    } else if (url.includes("/api/analytics/overview")) {
      data = { overview: { totalSpend: 18245, totalConversions: 892, avgCpa: 20.4, avgRoas: 4.1 } };
    } else if (url.includes("/api/analytics/trends")) {
      data = { trends: [
        { date: "Day 1", spend: 300, conversions: 20 },
        { date: "Day 2", spend: 350, conversions: 28 },
        { date: "Day 3", spend: 320, conversions: 24 },
        { date: "Day 4", spend: 400, conversions: 35 },
        { date: "Day 5", spend: 380, conversions: 31 },
        { date: "Day 6", spend: 450, conversions: 42 },
      ] };
    } else if (url.includes("/api/analytics/agents/activity")) {
      data = { activity: [
        { id: 1, agent_name: "Budget Strategist", action_type: "REALLOCATE", timestamp: new Date().toISOString(), description: "Reallocated ₹500 to top performing campaign." },
        { id: 2, agent_name: "Performance Detective", action_type: "FLAG", timestamp: new Date(Date.now() - 120000).toISOString(), description: "Identified ad fatigue in Spring Sale creatives." },
        { id: 3, agent_name: "Growth Executor", action_type: "SCALE", timestamp: new Date(Date.now() - 360000).toISOString(), description: "Scaled Lookalike Beta audience by 15%." },
      ] };
    } else if (url.includes("/api/campaigns")) {
      data = { campaigns: [
        { id: "c1", name: "Retargeting Alpha", objective: "CONVERSIONS", status: "ACTIVE" },
        { id: "c2", name: "Lookalike Beta", objective: "TRAFFIC", status: "PAUSED" },
        { id: "c3", name: "Spring Sale 2026", objective: "CONVERSIONS", status: "ACTIVE" },
        { id: "c4", name: "Video Views Q1", objective: "AWARENESS", status: "ACTIVE" },
        { id: "c5", name: "Lead Gen Master", objective: "LEADS", status: "ACTIVE" },
      ] };
    } else if (url.includes("/api/approvals")) {
      data = { approvals: [
        { id: 1, type: "budget_increase", title: "Scale Retargeting Alpha", description: "This campaign is yielding a 4.1x ROAS. We recommend increasing budget by 20%.", status: "PENDING", priority: "high", confidence_score: 0.92, action_details: { campaign_name: "Retargeting Alpha" } },
        { id: 2, type: "pause_campaign", title: "Pause Lookalike Beta", description: "CPA is 30% above the threshold you set. Pause immediately.", status: "PENDING", priority: "critical", confidence_score: 0.98, action_details: { campaign_name: "Lookalike Beta" } },
        { id: 3, type: "bid_adjustment", title: "Adjust Bids for Spring Sale", description: "Current bidding strategy is losing impression share. Switch to cost cap.", status: "PENDING", priority: "medium", confidence_score: 0.75, action_details: { campaign_name: "Spring Sale 2026" } },
      ] };
    }

    return Promise.resolve({ data, status: 200 });
  }
);

// Auth / Profile
export const authApi = {
  me: () => api.get("/api/auth/me"),
  updateProfile: (data: Record<string, unknown>) => api.patch("/api/auth/me", data),
  // No-op register/login kept so old code doesn't break
  register: () => api.post("/api/auth/register"),
  login: () => api.post("/api/auth/login"),
};

// Campaigns
export const campaignsApi = {
  list: (status = "ACTIVE") => api.get(`/api/campaigns?status=${status}`),
  insights: (id: string, days = 30) => api.get(`/api/campaigns/${id}/insights?days=${days}`),
  trend: (id: string, days = 30) => api.get(`/api/campaigns/${id}/trend?days=${days}`),
  audience: (id: string) => api.get(`/api/campaigns/${id}/audience`),
  funnel: (id: string) => api.get(`/api/campaigns/${id}/funnel`),
  pause: (id: string) => api.post(`/api/campaigns/${id}/pause`),
  updateBudget: (id: string, budget: number) =>
    api.post(`/api/campaigns/${id}/update-budget?new_budget=${budget}`),
  simulateTime: (hours = 4) =>
    api.post(`/api/campaigns/demo/simulate-time?hours=${hours}`),
};

// Approvals
export const approvalsApi = {
  list: (status?: string) =>
    api.get("/api/approvals" + (status ? `?status=${status}` : "")),
  history: () => api.get("/api/approvals/history"),
  approve: (id: number, notes?: string) =>
    api.post(`/api/approvals/${id}/approve`, { notes }),
  reject: (id: number, notes?: string) =>
    api.post(`/api/approvals/${id}/reject`, { notes }),
};

// Analytics
export const analyticsApi = {
  overview: () => api.get("/api/analytics/overview"),
  trends: (days = 30) => api.get(`/api/analytics/trends?days=${days}`),
  agentActivity: (limit = 50) =>
    api.get(`/api/analytics/agents/activity?limit=${limit}`),
  runCycle: () => api.post("/api/analytics/agents/run-cycle"),
  insights: () => api.get("/api/analytics/insights"),
};

// CSV Import
export const csvApi = {
  upload: (file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/api/csv/upload-csv", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
  },
  analyze: (data: {
    channelBreakdown: unknown[];
    audiencePerformance: unknown[];
    hourlyConversions: unknown[];
    total_rows: number;
  }) => api.post("/api/csv/analyze", data),
};

// Creative Studio
export const creativeStudioApi = {
  generateAd: (data: {
    business: string;
    description: string;
    goal: "Sales" | "Leads" | "Traffic" | "Awareness";
    platform: "Instagram" | "Facebook" | "Both";
    tone: "Premium" | "Funny" | "Aggressive" | "Minimal";
  }) => api.post("/api/creative-studio/generate-ad", data),

  improveAd: (data: {
    campaignName: string;
    adCopy: string;
    audience?: Record<string, unknown>;
    hooks?: string[];
  }) => api.post("/api/creative-studio/improve-ad", data),

  regenerate: (data: {
    section: "hooks" | "adCopy";
    business: string;
    description: string;
    goal: string;
    platform: string;
    tone: string;
    currentCampaignName?: string;
  }) => api.post("/api/creative-studio/regenerate", data),
};

export default api;

