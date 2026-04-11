import { useState } from "react";

interface Creative {
  id: string;
  name: string;
  format: "image" | "video" | "carousel" | "story";
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  impressions: number;
  clicks: number;
  conversions: number;
  thumbnail_color: string;
}

interface Props {
  creatives?: Creative[];
}

const FORMAT_ICONS: Record<string, string> = {
  image: "image",
  video: "play_circle",
  carousel: "view_carousel",
  story: "amp_stories",
};

const FORMAT_COLORS: Record<string, string> = {
  image: "bg-blue-50 text-blue-600 border-blue-200",
  video: "bg-rose-50 text-rose-600 border-rose-200",
  carousel: "bg-violet-50 text-violet-600 border-violet-200",
  story: "bg-amber-50 text-amber-600 border-amber-200",
};

const FALLBACK_CREATIVES: Creative[] = [
  { id: "c1", name: "Summer Drop — Bold Hoodie Reveal", format: "video",    spend: 12400, revenue: 67200, roas: 5.42, ctr: 4.8,  impressions: 284000, clicks: 13632, conversions: 412, thumbnail_color: "#566252" },
  { id: "c2", name: "Sneaker Drop 001 — Clean Grid",   format: "carousel", spend: 9800,  revenue: 48000, roas: 4.90, ctr: 3.9,  impressions: 196000, clicks: 7644,  conversions: 298, thumbnail_color: "#8B7355" },
  { id: "c3", name: "Lifestyle Static — Urban Scene",  format: "image",    spend: 7200,  revenue: 31680, roas: 4.40, ctr: 2.7,  impressions: 142000, clicks: 3834,  conversions: 201, thumbnail_color: "#a8b5a2" },
  { id: "c4", name: "Flash Story — 24H Drop Alert",    format: "story",    spend: 4100,  revenue: 16400, roas: 4.00, ctr: 6.2,  impressions: 98000,  clicks: 6076,  conversions: 164, thumbnail_color: "#C1AA90" },
  { id: "c5", name: "Retargeting — Abandoned Cart",    format: "image",    spend: 3600,  revenue: 12240, roas: 3.40, ctr: 5.1,  impressions: 62000,  clicks: 3162,  conversions: 128, thumbnail_color: "#6B7280" },
];

type SortKey = "roas" | "ctr" | "conversions" | "spend";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "roas",        label: "ROAS"        },
  { key: "ctr",         label: "CTR"         },
  { key: "conversions", label: "Conversions" },
  { key: "spend",       label: "Spend"       },
];

export function TopCreatives({ creatives = FALLBACK_CREATIVES }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("roas");
  const [filterFormat, setFilterFormat] = useState<string>("all");

  const formats = ["all", ...Array.from(new Set(creatives.map((c) => c.format)))];

  const sorted = [...creatives]
    .filter((c) => filterFormat === "all" || c.format === filterFormat)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const maxRoas = Math.max(...sorted.map((c) => c.roas), 1);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-outline-variant/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Creative Performance</span>
            </div>
            <h4 className="font-serif text-2xl font-bold text-on-surface">Top Creatives</h4>
            <p className="text-stone-400 text-xs mt-0.5">Best-performing ad formats ranked by impact</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Format filter pills */}
            <div className="flex gap-1 p-1 bg-surface-container-high rounded-lg">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterFormat(f)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filterFormat === f
                      ? "bg-primary text-white shadow-sm"
                      : "text-stone-500 hover:text-on-surface"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 mt-5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                sortBy === opt.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {opt.key === "roas" ? "trending_up" : opt.key === "ctr" ? "ads_click" : opt.key === "conversions" ? "shopping_cart" : "paid"}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Creative list */}
      <div className="divide-y divide-outline-variant/10">
        {sorted.slice(0, 5).map((creative, idx) => (
          <div
            key={creative.id}
            className="group flex items-center gap-5 p-5 hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
          >
            {/* Rank */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
              idx === 0 ? "bg-amber-400 text-white shadow-md" :
              idx === 1 ? "bg-stone-300 text-stone-700" :
              idx === 2 ? "bg-amber-700/30 text-amber-800" :
              "bg-surface-container-high text-stone-400"
            }`}>
              {idx + 1}
            </div>

            {/* Thumbnail */}
            <div
              className="w-14 h-10 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden"
              style={{ background: creative.thumbnail_color }}
            >
              <span className="material-symbols-outlined text-white/80 text-lg">
                {FORMAT_ICONS[creative.format]}
              </span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-on-surface truncate">{creative.name}</p>
                <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${FORMAT_COLORS[creative.format]}`}>
                  <span className="material-symbols-outlined text-[10px]">{FORMAT_ICONS[creative.format]}</span>
                  {creative.format}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-stone-400 font-medium">
                <span>{creative.impressions.toLocaleString()} impr.</span>
                <span>{creative.clicks.toLocaleString()} clicks</span>
                <span>{creative.conversions} conv.</span>
              </div>
              {/* ROAS progress bar */}
              <div className="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden w-full max-w-xs">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(creative.roas / maxRoas) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="text-center hidden sm:block">
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">CTR</p>
                <p className="text-sm font-bold text-on-surface">{creative.ctr.toFixed(1)}%</p>
              </div>
              <div className="text-center hidden md:block">
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Spend</p>
                <p className="text-sm font-bold text-on-surface">₹{(creative.spend / 1000).toFixed(1)}k</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">ROAS</p>
                <p className={`text-sm font-bold ${creative.roas >= 4 ? "text-primary" : creative.roas >= 3 ? "text-amber-600" : "text-red-500"}`}>
                  {creative.roas.toFixed(2)}x
                </p>
              </div>
              <span className="material-symbols-outlined text-stone-300 group-hover:text-primary transition-colors text-base">
                chevron_right
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center">
        <p className="text-[10px] text-stone-400 font-medium">Showing top {Math.min(5, sorted.length)} of {sorted.length} creatives</p>
        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
          View All
          <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
