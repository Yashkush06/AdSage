import type { FunnelStep } from "../../types";
import { formatNumber } from "../../lib/utils";

interface Props {
  steps: FunnelStep[];
}

export function FunnelVisualization({ steps }: Props) {
  const maxCount = steps[0]?.count || 1;

  const getStepIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('impression')) return 'visibility';
    if (l.includes('click')) return 'touch_app';
    if (l.includes('cart')) return 'shopping_cart';
    if (l.includes('purchase') || l.includes('conversion')) return 'redeem';
    return 'filter_alt';
  };

  return (
    <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="font-serif text-xl font-bold">Conversion Tunnel</h4>
          <p className="text-stone-400 text-xs tracking-tight">User Journey Efficiency</p>
        </div>
        <span className="material-symbols-outlined text-primary text-2xl">insights</span>
      </div>

      <div className="space-y-6 flex-1">
        {steps.map((step, i) => {
          const pct = (step.count / maxCount) * 100;
          return (
            <div key={step.step} className="group relative">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c24] border border-outline-variant/30 flex items-center justify-center shadow-sm group-hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-stone-400">
                      {getStepIcon(step.label)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface uppercase tracking-widest">{step.label}</p>
                    <p className="text-[10px] text-stone-400 font-medium">Stage {i + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">{formatNumber(step.count)}</p>
                  {step.drop_rate > 0 && (
                    <p className="text-[10px] text-error font-bold italic">
                      −{step.drop_rate}% Drop
                    </p>
                  )}
                </div>
              </div>
              
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-outline-variant/10">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out group-hover:bg-primary-container shadow-[0_0_8px_rgba(255,59,59,0.3)]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Connector line for the next step */}
              {i < steps.length - 1 && (
                <div className="absolute left-[15px] top-[40px] w-px h-[24px] bg-outline-variant/30 z-0"></div>
              )}
            </div>
          );
        })}
      </div>

      {steps.length > 1 && (
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-xl">key</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">Yield Efficiency</p>
            <p className="text-lg font-serif font-bold text-primary">
              {steps[0]?.count > 0
                ? `${((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(1)}%`
                : "N/A"}
              <span className="text-xs font-sans font-normal text-stone-400 ml-2 italic text-sm">Convert Rate</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
