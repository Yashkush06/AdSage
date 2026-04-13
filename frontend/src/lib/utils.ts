export function formatCurrency(value: number, currency = "₹"): string {
  if (value >= 100000) return `${currency}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000)   return `${currency}${(value / 1000).toFixed(1)}K`;
  return `${currency}${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)    return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case "critical": return "badge-red";
    case "high":     return "badge-amber";
    case "medium":   return "badge-blue";
    default:         return "badge-gray";
  }
}

export function riskColor(risk: string): string {
  switch (risk) {
    case "high":   return "badge-red";
    case "medium": return "badge-amber";
    default:       return "badge-green";
  }
}

export function trendIcon(trend: string): string {
  switch (trend) {
    case "improving": return "↗";
    case "declining": return "↘";
    default:          return "→";
  }
}
