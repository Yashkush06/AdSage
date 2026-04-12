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
    <div className="bg-[#181A2F] p-8 rounded-xl border border-[#37415C]/20 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="font-serif text-xl font-bold text-white">Conversion Tunnel</h4>
          <p className="text-[#FDA481]/50 text-xs tracking-tight">User Journey Efficiency</p>
        </div>
        <span className="material-symbols-outlined text-[#FDA481] text-2xl">insights</span>
      </div>

      <div className="space-y-6 flex-1">
        {steps.map((step, i) => {
          const pct = (step.count / maxCount) * 100;
          return (
            <div key={step.step} className="group relative">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#242E49] border border-[#37415C]/30 flex items-center justify-center shadow-sm group-hover:border-[#FDA481] transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-[#FDA481]/60">
                      {getStepIcon(step.label)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">{step.label}</p>
                    <p className="text-[10px] text-[#FDA481]/40 font-medium">Stage {i + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatNumber(step.count)}</p>
                  {step.drop_rate > 0 && (
                    <p className="text-[10px] text-[#B4182D] font-bold italic">
                      −{step.drop_rate}% Drop
                    </p>
                  )}
                </div>
              </div>
              
              <div className="h-2 bg-[#37415C]/20 rounded-full overflow-hidden border border-[#37415C]/10">
                <div
                  className="h-full bg-[#FDA481] rounded-full transition-all duration-1000 ease-out group-hover:bg-[#B4182D] shadow-[0_0_10px_#FDA48130]"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Connector line for the next step */}
              {i < steps.length - 1 && (
                <div className="absolute left-[15px] top-[40px] w-px h-[24px] bg-[#37415C]/30 z-0"></div>
              )}
            </div>
          );
        })}
      </div>

      {steps.length > 1 && (
        <div className="mt-8 p-4 bg-[#FDA481]/5 border border-[#FDA481]/20 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FDA481] flex items-center justify-center shrink-0 shadow-lg shadow-[#FDA481]/20">
            <span className="material-symbols-outlined text-[#181A2F] text-xl">key</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#FDA481]">Yield Efficiency</p>
            <p className="text-lg font-serif font-bold text-[#FDA481]">
              {steps[0]?.count > 0
                ? `${((steps[steps.length - 1].count / steps[0].count) * 100).toFixed(1)}%`
                : "N/A"}
              <span className="text-xs font-sans font-normal text-[#FDA481]/40 ml-2 italic">Convert Rate</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
