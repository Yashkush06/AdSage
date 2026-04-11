import type { OverviewMetrics } from "../../types";
import { formatCurrency, formatNumber } from "../../lib/utils";

interface Props {
  metrics: OverviewMetrics;
}

export function MetricsCards({ metrics }: Props) {
  const cards = [
    {
      label: "Total Spend",
      value: formatCurrency(metrics.total_spend),
      growth: "+4.2%",
      progress: 72,
      colorClass: "bg-primary-container",
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.total_revenue),
      growth: "+12.8%",
      progress: 88,
      colorClass: "bg-primary",
    },
    {
      label: "Conversions",
      value: formatNumber(metrics.total_conversions),
      growth: "+8.1%",
      progress: 64,
      colorClass: "bg-secondary",
    },
    {
      label: "Active Ads",
      value: String(metrics.active_campaigns),
      growth: "-2.1%",
      progress: 45,
      colorClass: "bg-primary-container/50",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div 
          key={card.label} 
          className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <p className="font-sans tracking-wide uppercase text-[10px] text-stone-400 mb-2 font-bold group-hover:text-primary transition-colors">
            {card.label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-serif font-bold text-on-surface">
              {card.value}
            </h3>
            <span className={`text-[10px] font-bold ${card.growth.startsWith('+') ? 'text-primary' : 'text-stone-400'} flex items-center`}>
              {card.growth}
            </span>
          </div>
          <div className="mt-4 w-full h-1 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`${card.colorClass} h-full transition-all duration-1000 ease-out`} 
              style={{ width: `${card.progress}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
