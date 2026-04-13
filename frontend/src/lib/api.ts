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
      data = { success: true, id: 1, email: "demo@adsage.com", business_name: "Verse Demo" };
    } else if (url.includes("/api/analytics/overview")) {
      data = { success: true, overview: { 
        total_spend: 18245, 
        total_revenue: 74804, 
        total_conversions: 892, 
        total_clicks: 4500,
        total_impressions: 120000,
        avg_cpa: 20.4, 
        avg_roas: 4.1,
        avg_ctr: 0.0375,
        active_campaigns: 5,
        paused_campaigns: 2,
        period_days: 30
      } };
    } else if (url.includes("/api/analytics/trends")) {
      data = { success: true, trends: [
        { date: "2026-04-08", spend: 300, conversions: 20, revenue: 1200, roas: 4.0 },
        { date: "2026-04-09", spend: 350, conversions: 28, revenue: 1600, roas: 4.5 },
        { date: "2026-04-10", spend: 320, conversions: 24, revenue: 1300, roas: 4.0 },
        { date: "2026-04-11", spend: 400, conversions: 35, revenue: 1900, roas: 4.7 },
        { date: "2026-04-12", spend: 380, conversions: 31, revenue: 1500, roas: 3.9 },
        { date: "2026-04-13", spend: 450, conversions: 42, revenue: 2100, roas: 4.6 },
      ] };
    } else if (url.includes("/api/analytics/agents/activity")) {
      data = { success: true, activity: [
        { id: 1, agent_name: "Budget Strategist", level: "info", created_at: new Date().toISOString(), message: "Reallocated ₹500 to top performing campaign Alpha." },
        { id: 2, agent_name: "Performance Detective", level: "warning", created_at: new Date(Date.now() - 120000).toISOString(), message: "Identified high bounce rate in Landing Page B." },
        { id: 3, agent_name: "Growth Executor", level: "info", created_at: new Date(Date.now() - 360000).toISOString(), message: "Scaled Lookalike Beta audience by 15% due to high ROAS." },
      ] };
    } else if (url.includes("/api/campaigns")) {
      data = { success: true, campaigns: [
        { id: "c1", name: "Retargeting Alpha", objective: "CONVERSIONS", status: "ACTIVE", daily_budget_inr: 500 },
        { id: "c2", name: "Lookalike Beta", objective: "TRAFFIC", status: "PAUSED", daily_budget_inr: 200 },
        { id: "c3", name: "Spring Sale 2026", objective: "CONVERSIONS", status: "ACTIVE", daily_budget_inr: 1000 },
        { id: "c4", name: "Video Views Q1", objective: "AWARENESS", status: "ACTIVE", daily_budget_inr: 300 },
        { id: "c5", name: "Lead Gen Master", objective: "LEADS", status: "ACTIVE", daily_budget_inr: 450 },
      ] };
    } else if (url.includes("/api/approvals")) {
      data = { success: true, approvals: [
        { id: 1, type: "Budget Scale", title: "Increase Alpha Budget", description: "Campaign Alpha is at 4.1x ROAS. Scale budget by 20%.", status: "PENDING", priority: "high", confidence_score: 0.92, agent_name: "Budget Agent", action_details: { campaign_name: "Retargeting Alpha" } },
        { id: 2, type: "Campaign Stop", title: "Pause Fatigue Creative", description: "CTR dropped 40% in last 24h for Creative V2.", status: "PENDING", priority: "critical", confidence_score: 0.98, agent_name: "Fatigue Agent", action_details: { campaign_name: "Spring Sale 2026" } },
        { id: 3, type: "Bid Tuning", title: "Lower Target CPA", description: "Market signals indicate lower CPC availability.", status: "PENDING", priority: "medium", confidence_score: 0.75, agent_name: "Bid Agent", action_details: { campaign_name: "Lead Gen Master" } },
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

