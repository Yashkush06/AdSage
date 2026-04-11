import { useState } from "react";
import { creativeStudioApi } from "../lib/api";

type Goal = "Sales" | "Leads" | "Traffic" | "Awareness";
type Platform = "Instagram" | "Facebook" | "Both";
type Tone = "Premium" | "Funny" | "Aggressive" | "Minimal";

interface AdResult {
  campaignName: string;
  hooks: string[];
  targetAudience: {
    age?: string;
    interests?: string[];
    location?: string;
    behaviors?: string[];
    gender?: string;
  };
  adCopy: string;
  creativeIdeas: string[];
  callToAction?: string;
  estimatedBudget?: string;
  keyMetrics?: string[];
  improvements?: string[];
  estimatedImpact?: string;
}

export function CreativeStudio() {
  const [activeTab, setActiveTab] = useState<"generate" | "improve">("generate");

  // Form State
  const [business, setBusiness] = useState("AdSage AI");
  const [description, setDescription] = useState("Automated Meta Ads management platform that uses AI to monitor, optimize, and scale campaigns 24/7. Perfect for digital marketing agencies and e-commerce brands.");
  const [goal, setGoal] = useState<Goal>("Sales");
  const [platform, setPlatform] = useState<Platform>("Both");
  const [tone, setTone] = useState<Tone>("Premium");

  // Improve Form State
  const [existingCampaignName, setExistingCampaignName] = useState("");
  const [existingAdCopy, setExistingAdCopy] = useState("We help you run better ads. Try our new AI tool today. It saves time and makes money.");

  // Result State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adHistory, setAdHistory] = useState<AdResult[]>([]);
  const currentAd = adHistory[0]; // show latest

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate minor progress for UX
    try {
      const res = await creativeStudioApi.generateAd({
        business,
        description,
        goal,
        platform,
        tone,
      });
      if (res.data.success) {
        setAdHistory([{ ...res.data.ad, _id: Date.now() }, ...adHistory]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.data.detail || "Failed to generate ad.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await creativeStudioApi.improveAd({
        campaignName: existingCampaignName || "Current Campaign",
        adCopy: existingAdCopy,
      });
      if (res.data.success) {
        setAdHistory([{ ...res.data.ad, _id: Date.now() }, ...adHistory]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.data.detail || "Failed to improve ad.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateHooks = async () => {
    if (!currentAd) return;
    setLoading(true);
    try {
      const res = await creativeStudioApi.regenerate({
        section: "hooks",
        business,
        description,
        goal,
        platform,
        tone,
        currentCampaignName: currentAd.campaignName,
      });
      if (res.data.success && res.data.hooks) {
        const updatedAd = { ...currentAd, hooks: res.data.hooks };
        const newHistory = [...adHistory];
        newHistory[0] = updatedAd;
        setAdHistory(newHistory);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to regenerate hooks.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
            <h1 className="text-3xl font-bold font-serif text-on-surface">Creative Studio</h1>
          </div>
          <p className="text-stone-500">AI-powered ad copy and campaign generation based on proven Meta Ads frameworks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-2 rounded-2xl flex gap-1 mb-6 bg-surface-container-low max-w-fit">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex gap-2 items-center ${activeTab === "generate" ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-on-surface"}`}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              New Campaign
            </button>
            <button
              onClick={() => setActiveTab("improve")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex gap-2 items-center ${activeTab === "improve" ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-on-surface"}`}
            >
              <span className="material-symbols-outlined text-[18px]">magic_button</span>
              Improve Existing
            </button>
          </div>

          <div className="glass-card p-6 border-t-4 border-primary">
            {activeTab === "generate" ? (
              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Business / Product Name</label>
                  <input required value={business} onChange={e => setBusiness(e.target.value)} type="text" placeholder="e.g. FitTrack Pro" className="input" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Product Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe what you sell, who it's for, and your main value proposition..." className="input rounded-2xl resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Goal</label>
                    <select value={goal} onChange={e => setGoal(e.target.value as Goal)} className="input bg-white cursor-pointer appearance-none">
                      <option>Sales</option>
                      <option>Leads</option>
                      <option>Traffic</option>
                      <option>Awareness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="input bg-white cursor-pointer appearance-none">
                      <option>Both</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Premium", "Funny", "Aggressive", "Minimal"] as Tone[]).map((t) => (
                      <button
                        key={t} type="button"
                        onClick={() => setTone(t)}
                        className={`py-2 px-3 text-sm rounded-xl border transition-all ${tone === t ? "border-primary bg-primary/5 text-primary font-bold" : "border-outline-variant/30 text-stone-500 hover:border-outline-variant"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 mt-4 opacity-100 disabled:opacity-50 transition-opacity">
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin">progress_activity</span> Generating...</>
                  ) : (
                    <><span className="material-symbols-outlined">auto_awesome</span> Generate Campaign</>
                  )}
                </button>
                {error && <p className="text-error text-sm mt-3">{error}</p>}
              </form>
            ) : (
              <form onSubmit={handleImprove} className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Campaign Name (Optional)</label>
                  <input value={existingCampaignName} onChange={e => setExistingCampaignName(e.target.value)} type="text" placeholder="e.g. Q3 Summer Sale" className="input" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Current Ad Copy</label>
                  <textarea required value={existingAdCopy} onChange={e => setExistingAdCopy(e.target.value)} rows={6} placeholder="Paste your underperforming ad copy here..." className="input rounded-2xl resize-none" />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm text-primary">
                  <span className="material-symbols-outlined mt-0.5">info</span>
                  <p>Our AI will rewrite this copy to increase conversion rate based on proven direct-response frameworks.</p>
                </div>

                <button disabled={loading} type="submit" className="w-full btn-primary py-3.5 mt-2 opacity-100 disabled:opacity-50">
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin">progress_activity</span> Optimizing...</>
                  ) : (
                    <><span className="material-symbols-outlined">magic_button</span> Improve Ad Copy</>
                  )}
                </button>
                {error && <p className="text-error text-sm mt-3">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Output Viewer */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-[600px] glass-card flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                 <span className="material-symbols-outlined text-4xl text-primary animate-spin">analytics</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-on-surface mb-2">Consulting the Oracle...</h3>
              <p className="max-w-md">Analyzing millions of data points to generate high-converting creative angles for your business.</p>
            </div>
          ) : currentAd ? (
            <div className="space-y-6 animate-slide-up">
              
              {/* Campaign Header Output */}
              <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-primary bg-gradient-to-r from-surface to-transparent">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                      {activeTab === 'generate' ? 'Generated' : 'Optimized'} Campaign
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-on-surface tracking-tight">{currentAd.campaignName}</h2>
                </div>
                <div className="flex gap-2">
                   <button className="btn-ghost shadow-sm border border-outline-variant/30 bg-white" onClick={() => handleCopy(JSON.stringify(currentAd, null, 2))}>
                     <span className="material-symbols-outlined text-[18px]">content_copy</span> Export JSON
                   </button>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hooks */}
                <div className="glass-card p-6 flex flex-col h-full bg-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -z-0"></div>
                  
                  <div className="flex justify-between items-start mb-6 z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary">draw</span>
                      <h3 className="font-bold text-on-surface text-lg">Scroll-Stopping Hooks</h3>
                    </div>
                    <button onClick={handleRegenerateHooks} className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors" title="Regenerate Hooks">
                      <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                  </div>
                  
                  <ul className="space-y-4 flex-1 z-10">
                    {currentAd.hooks.map((hook, idx) => (
                      <li key={idx} className="group flex gap-3 items-start relative">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 border border-stone-200">{idx + 1}</span>
                        <p className="text-[15px] font-medium leading-snug">{hook}</p>
                        <button onClick={() => handleCopy(hook)} className="opacity-0 group-hover:opacity-100 absolute -right-2 top-0 p-1 text-stone-400 hover:text-primary transition-all">
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Audience Context */}
                <div className="glass-card p-6 bg-surface-container-lowest">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">target</span>
                    <h3 className="font-bold text-on-surface text-lg">Target Audience</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface py-2 px-3 rounded-xl border border-outline-variant/30">
                        <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Age Range</span>
                        <span className="font-semibold">{currentAd.targetAudience.age || "All ages"}</span>
                      </div>
                      <div className="bg-surface py-2 px-3 rounded-xl border border-outline-variant/30">
                        <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Gender</span>
                        <span className="font-semibold">{currentAd.targetAudience.gender || "All"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">Location</span>
                      <p className="text-sm font-medium">{currentAd.targetAudience.location || "Default"}</p>
                    </div>
                    {currentAd.targetAudience.interests && (
                      <div>
                        <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">Interests</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentAd.targetAudience.interests.map(i => (
                            <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">{i}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Main Ad Copy Area */}
              <div className="glass-card p-0 overflow-hidden flex flex-col md:flex-row border-primary/20 bg-white">
                <div className="p-6 md:p-8 flex-1">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">edit_document</span>
                       <h3 className="font-bold text-on-surface text-lg">Body Copy</h3>
                    </div>
                    <button className="text-stone-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold" onClick={() => handleCopy(currentAd.adCopy)}>
                      <span className="material-symbols-outlined text-[18px]">content_copy</span> Copy
                    </button>
                  </div>
                  
                  <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 relative mt-2 group">
                    <div className="absolute top-2 left-2 text-stone-300 pointer-events-none">
                       <span className="material-symbols-outlined text-4xl transform scale-x-[-1] opacity-50">format_quote</span>
                    </div>
                    <p className="text-[15px] leading-relaxed relative z-10 whitespace-pre-wrap pl-4 font-medium text-stone-800">
                      {currentAd.adCopy}
                    </p>
                  </div>
                  
                  {currentAd.callToAction && (
                    <div className="mt-6 flex items-center justify-between border-t border-outline-variant/20 pt-4">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Call to Action</span>
                      <button className="px-5 py-2 bg-stone-800 text-white rounded-lg text-sm font-bold shadow-md hover:bg-stone-700 transition-colors">
                        {currentAd.callToAction}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Right side snippet (Improvements or Creative Ideas) */}
                <div className="bg-[#fcf9f4] border-l border-outline-variant/20 md:w-72 p-6">
                  {currentAd.improvements ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-tertiary">trending_up</span>
                        <h4 className="font-bold text-sm">Why it's better</h4>
                      </div>
                      <ul className="space-y-3">
                        {currentAd.improvements.map((imp, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-stone-600">
                            <span className="material-symbols-outlined text-[16px] text-green-600 shrink-0">check_circle</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                      {currentAd.estimatedImpact && (
                         <div className="mt-6 p-3 bg-white rounded-xl border border-outline-variant/30">
                           <span className="block text-[10px] text-stone-500 font-bold uppercase mb-1">Est. Impact</span>
                           <span className="text-sm font-bold text-green-700">{currentAd.estimatedImpact}</span>
                         </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-secondary">videocam</span>
                        <h4 className="font-bold text-sm">Creative Angles</h4>
                      </div>
                      <ul className="space-y-4">
                        {currentAd.creativeIdeas.map((idea, idx) => (
                          <li key={idx} className="bg-white p-3 rounded-xl border border-outline-variant/30 text-[13px] leading-snug shadow-sm">
                            <span className="inline-block w-4 h-4 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold mb-1">{idx+1}</span>
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-[600px] glass-card flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-outline-variant/50 cursor-pointer hover:bg-surface-variant/20 transition-colors" onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()}>
              <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-stone-400">psychology</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-600 mb-2">Ready to Brainstorm</h3>
              <p className="text-stone-400 max-w-sm text-sm">Fill out your business details and hit generate to craft high-converting ad formulas instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
