import axios from "axios";

// Vite proxy routes /api and /ws to localhost:8000
// No auth headers needed — backend uses hardcoded user_id=1
const baseURL = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL });

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

