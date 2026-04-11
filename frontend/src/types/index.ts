// All shared TypeScript types

export interface User {
  id: number;
  email: string;
  business_name?: string;
  industry?: string;
  target_cpa?: number;
  target_roas?: number;
  monthly_budget?: number;
  auto_approve_low_risk?: boolean;
  created_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  objective: string;
  daily_budget_inr: number;
  created_time: string;
  updated_time: string;
}

export interface CampaignInsights {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversion_rate: number;
  audience: string;
  trend: "improving" | "declining" | "stable";
  daily_budget: number;
}

export interface DailyTrendRow {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  campaign_name?: string;
  campaign_id?: string;
}

export interface AudienceSegment {
  age: string;
  gender: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  roas: number;
}

export interface FunnelStep {
  step: string;
  label: string;
  count: number;
  drop_rate: number;
}

export interface OverviewMetrics {
  total_spend: number;
  total_revenue: number;
  total_conversions: number;
  total_clicks: number;
  total_impressions: number;
  avg_roas: number;
  avg_cpa: number;
  avg_ctr: number;
  active_campaigns: number;
  paused_campaigns: number;
  period_days: number;
}

export type RecommendationPriority = "low" | "medium" | "high" | "critical";
export type RecommendationRisk = "low" | "medium" | "high";
export type RecStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "AUTO_APPROVED" | "FAILED";

export interface Recommendation {
  id: number;
  agent_name: string;
  type: string;
  status: RecStatus;
  priority: RecommendationPriority;
  title: string;
  description: string;
  reasoning?: string;
  risk_level: RecommendationRisk;
  confidence_score: number;
  data_supporting: Record<string, unknown>;
  action_details: Record<string, unknown>;
  predicted_impact: Record<string, unknown>;
  created_at: string;
}

export interface AgentActivity {
  id: number;
  agent_name: string;
  level: "info" | "warning" | "error";
  message: string;
  created_at: string;
}

export interface AIInsights {
  headline: string;
  key_wins: string[];
  key_concerns: string[];
  action_items: string[];
  week_rating: number;
}
