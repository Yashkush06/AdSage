import type { OverviewMetrics } from "../../types";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { motion } from "framer-motion";

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
      {cards.map((card, i) => (
        <motion.div 
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ 
            y: -12,
            scale: 1.02,
            borderColor: "rgba(255, 59, 59, 0.3)",
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          className="glass-card p-6 group cursor-default relative"
        >
          {/* Enhanced Hover Glow */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <p className="relative z-10 font-sans tracking-wide uppercase text-[10px] text-stone-400 mb-2 font-bold group-hover:text-primary transition-colors">
            {card.label}
          </p>
          <div className="relative z-10 flex items-baseline gap-2">
            <h3 className="text-2xl font-serif font-bold text-on-surface">
              {card.value}
            </h3>
            <span className={`text-[10px] font-bold ${card.growth.startsWith('+') ? 'text-primary' : 'text-stone-400'} flex items-center`}>
              {card.growth}
            </span>
          </div>
          <div className="relative z-10 mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${card.progress}%` }}
              transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
              className={`${card.colorClass} h-full shadow-[0_0_12px_rgba(255,59,59,0.5)] group-hover:shadow-[0_0_16px_#FF3B3B] transition-shadow`} 
            />
          </div>
        </motion.div>
      ))}
    </section>
  );
}
