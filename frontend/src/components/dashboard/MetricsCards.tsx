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
<<<<<<< HEAD
      barColor: "#FF0032",
=======
      colorClass: "bg-white",
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.total_revenue),
      growth: "+12.8%",
      progress: 88,
      barColor: "#00F0FF",
    },
    {
      label: "Conversions",
      value: formatNumber(metrics.total_conversions),
      growth: "+8.1%",
      progress: 64,
      barColor: "#FDA481",
    },
    {
      label: "Active Ads",
      value: String(metrics.active_campaigns),
      growth: "-2.1%",
      progress: 45,
<<<<<<< HEAD
      barColor: "#ffffff",
=======
      colorClass: "bg-white/60",
>>>>>>> 6f02f14 (Update UI visibility, auth models, and add glassmorphism components)
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#242E49] p-6 rounded-3xl border border-[#37415C]/30 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <p className="font-sans tracking-wide uppercase text-[10px] text-[#FDA481]/50 mb-2 font-bold">
            {card.label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-serif font-bold text-white">
              {card.value}
            </h3>
            <span className={`text-[10px] font-bold ${card.growth.startsWith('+') ? 'text-[#FF0032]' : 'text-[#FDA481]/40'}`}>
              {card.growth}
            </span>
          </div>
          <div className="mt-4 w-full h-1 bg-[#37415C] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${card.progress}%`, backgroundColor: card.barColor }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
