import { useState, Component } from "react";
import { creativeStudioApi } from "../lib/api";
import { WaveButton } from "../components/shared/WaveButton";

// Error boundary to prevent full blank screen on render crash
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center p-8 border border-[#FF0032]/20 rounded-xl max-w-md">
          <span className="material-symbols-outlined text-4xl text-[#FF0032]/40 mb-4 block">error</span>
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Render Error</p>
          <p className="text-white/20 text-xs mt-2">{this.state.error}</p>
          <button onClick={() => this.setState({ error: null })} className="mt-6 px-6 py-2 bg-[#FF0032] text-white text-xs font-black uppercase tracking-widest">Retry</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

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
  return <ErrorBoundary><CreativeStudioInner /></ErrorBoundary>;
}

function CreativeStudioInner() {
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
        const ad = res.data.ad;
        setAdHistory([{
          campaignName: ad.campaignName || "Untitled Campaign",
          hooks: Array.isArray(ad.hooks) ? ad.hooks : [],
          targetAudience: ad.targetAudience || {},
          adCopy: ad.adCopy || "",
          creativeIdeas: Array.isArray(ad.creativeIdeas) ? ad.creativeIdeas : [],
          callToAction: ad.callToAction,
          estimatedBudget: ad.estimatedBudget,
          keyMetrics: Array.isArray(ad.keyMetrics) ? ad.keyMetrics : [],
        }, ...adHistory]);
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
        const ad = res.data.ad;
        setAdHistory([{
          campaignName: ad.campaignName || "Improved Campaign",
          hooks: Array.isArray(ad.hooks) ? ad.hooks : [],
          targetAudience: ad.targetAudience || {},
          adCopy: ad.adCopy || "",
          creativeIdeas: Array.isArray(ad.creativeIdeas) ? ad.creativeIdeas : [],
          callToAction: ad.callToAction,
          estimatedBudget: ad.estimatedBudget,
          keyMetrics: Array.isArray(ad.keyMetrics) ? ad.keyMetrics : [],
          improvements: Array.isArray(ad.improvements) ? ad.improvements : [],
          estimatedImpact: ad.estimatedImpact,
        }, ...adHistory]);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-[#FF0032] text-4xl shadow-[0_0_15px_rgba(255,0,50,0.4)]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <h1 className="text-4xl font-black font-serif text-white uppercase italic tracking-tighter">Creative Studio</h1>
          </div>
          <p className="text-[#00F0FF]/80 font-bold uppercase tracking-[0.2em] text-[10px]">AI Content Generation — Proven Framework Selection Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121214] p-1 rounded-xl flex gap-1 mb-6 border border-white/5">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex gap-2 items-center justify-center italic ${activeTab === "generate" ? "bg-[#FF0032] text-white shadow-[0_0_20px_rgba(255,0,50,0.3)]" : "text-white/60 hover:text-white"}`}
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              New Protocol
            </button>
            <button
              onClick={() => setActiveTab("improve")}
              className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex gap-2 items-center justify-center italic ${activeTab === "improve" ? "bg-[#00F0FF] text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]" : "text-white/60 hover:text-white"}`}
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Improve Existing
            </button>
          </div>

          <div className="bg-[#0A0A0C] border border-white/5 p-6 rounded-xl">
            {activeTab === "generate" ? (
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-3 italic">Business Name</label>
                  <input required value={business} onChange={e => setBusiness(e.target.value)} type="text" placeholder="e.g. FitTrack Pro" className="w-full bg-[#121214] border border-white/10 px-4 py-4 outline-none focus:border-[#FF0032] transition-all font-bold text-white uppercase italic text-sm placeholder:text-white/40 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-3 italic">Data Matrix (Description)</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Describe the artifact requirements..." className="w-full bg-[#121214] border border-white/10 px-4 py-4 outline-none focus:border-[#FF0032] transition-all font-bold text-white text-xs leading-relaxed placeholder:text-white/40 rounded-xl resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-3 italic">Directive</label>
                    <select value={goal} onChange={e => setGoal(e.target.value as Goal)} className="w-full bg-[#121214] border border-white/10 px-4 py-4 outline-none focus:border-[#FF0032] transition-all font-black text-white uppercase italic text-xs appearance-none rounded-xl cursor-pointer">
                      <option>Sales</option>
                      <option>Leads</option>
                      <option>Traffic</option>
                      <option>Awareness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-3 italic">Node</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className="w-full bg-[#121214] border border-white/10 px-4 py-4 outline-none focus:border-[#FF0032] transition-all font-black text-white uppercase italic text-xs appearance-none rounded-xl cursor-pointer">
                      <option>Both</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/60 uppercase tracking-[0.4em] mb-3 italic">Frequency (Tone)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Premium", "Funny", "Aggressive", "Minimal"] as Tone[]).map((t) => (
                      <button
                        key={t} type="button"
                        onClick={() => setTone(t)}
                        className={`py-3 px-3 text-[10px] font-black uppercase tracking-widest border transition-all rounded-xl italic ${tone === t ? "border-[#FF0032] bg-[#FF0032]/10 text-white shadow-[0_0_10px_rgba(255,0,50,0.2)]" : "border-white/5 text-white/50 hover:text-white"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <WaveButton
                  id="creative-studio-generate"
                  type="submit"
                  disabled={loading}
                  label={loading ? 'Syncing...' : 'Initiate Synthesis'}
                  hoverLabel="Generate Creative"
                  className="w-full mt-4"
                />
                {error && <p className="text-error text-sm mt-3">{error}</p>}
              </form>
            ) : (
              <form onSubmit={handleImprove} className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-[#FDA481]/80 uppercase tracking-wider mb-2">Campaign Name (Optional)</label>
                  <input value={existingCampaignName} onChange={e => setExistingCampaignName(e.target.value)} type="text" placeholder="e.g. Q3 Summer Sale" className="input bg-[#181A2F] border-[#37415C] text-white" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#FDA481]/80 uppercase tracking-wider mb-2">Current Ad Copy</label>
                  <textarea required value={existingAdCopy} onChange={e => setExistingAdCopy(e.target.value)} rows={6} placeholder="Paste your underperforming ad copy here..." className="input bg-[#181A2F] border-[#37415C] text-white rounded-2xl resize-none" />
                </div>

                <div className="bg-[#FDA481]/5 border border-[#FDA481]/20 rounded-xl p-4 flex gap-3 text-sm text-[#FDA481]">
                  <span className="material-symbols-outlined mt-0.5">info</span>
                  <p>Our AI will rewrite this copy to increase conversion rate based on proven direct-response frameworks.</p>
                </div>

                <WaveButton
                  id="creative-studio-improve"
                  type="submit"
                  disabled={loading}
                  label={loading ? 'Optimizing...' : 'Improve Ad Copy'}
                  hoverLabel="Rewrite Copy"
                  className="w-full mt-2"
                />
                {error && <p className="text-error text-sm mt-3">{error}</p>}
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Output Viewer */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-[600px] border border-white/5 bg-[#0A0A0C] flex flex-col items-center justify-center p-8 text-center rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF0032] via-transparent to-transparent animate-pulse" />
              <div className="w-24 h-24 rounded-xl bg-white/3 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                 <span className="material-symbols-outlined text-5xl text-[#FF0032] animate-pulse">hub</span>
              </div>
              <h3 className="text-2xl font-black font-serif text-white mb-3 uppercase italic tracking-tighter">Querying the Multiverse...</h3>
              <p className="max-w-md text-[#00F0FF]/40 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed italic">Decoding successful creative patterns from high-velocity campaign streams.</p>
            </div>
          ) : currentAd ? (
            <div className="space-y-8 animate-slide-up">
              
              {/* Campaign Header Output */}
              <div className="bg-white/3 border border-white/5 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF0032]" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0032]/5 rounded-xl transform translate-x-16 -translate-y-16 rotate-45 pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-[#FF0032]/10 border border-[#FF0032]/30 text-[#FF0032] text-[9px] font-black uppercase tracking-[0.4em] italic">
                      {activeTab === 'generate' ? 'Protocol Synthesis' : 'Node Optimization'} Complete
                    </span>
                  </div>
                  <h2 className="text-3xl font-black font-serif text-white tracking-tighter uppercase italic">{currentAd.campaignName}</h2>
                </div>
                <div className="flex gap-4">
                   <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all rounded-xl italic" onClick={() => handleCopy(JSON.stringify(currentAd, null, 2))}>
                     <span className="material-symbols-outlined text-[18px]">terminal</span> Export Schema
                   </button>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Hooks */}
                <div className="bg-[#121214] border border-white/5 p-8 flex flex-col h-full rounded-xl relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-24 bg-[#FF0032]/40" />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#FF0032] shadow-[0_0_10px_rgba(255,0,50,0.3)]">gesture</span>
                      <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic">Ad Hooks</h3>
                    </div>
                    <button onClick={handleRegenerateHooks} className="text-[#00F0FF]/40 hover:text-[#00F0FF] transition-all hover:rotate-180 duration-500" title="Refine Frequency">
                      <span className="material-symbols-outlined text-[20px]">sync</span>
                    </button>
                  </div>
                  
                  <ul className="space-y-6 flex-1 relative">
                    {currentAd.hooks.map((hook, idx) => (
                      <li key={idx} className="group flex gap-4 items-start relative border-l border-white/5 pl-5 py-1">
                        <span className="flex-shrink-0 text-[10px] font-black italic text-[#FF0032]/40 uppercase tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                        <p className="text-sm font-bold leading-relaxed text-white/80 group-hover:text-white transition-colors italic">{hook}</p>
                        <button onClick={() => handleCopy(hook)} className="opacity-0 group-hover:opacity-100 absolute -right-4 top-1 py-1 text-white/20 hover:text-[#00F0FF] transition-all">
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Audience Context */}
                <div className="bg-[#121214] border border-white/5 p-8 rounded-xl relative">
                   <div className="absolute top-0 right-0 w-1 h-24 bg-[#00F0FF]/40" />
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]">radar</span>
                    <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic">Target Audience</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/3 border border-white/10 p-4 rounded-xl">
                        <span className="block text-[8px] text-white/30 font-black uppercase tracking-[0.4em] mb-2 italic">Age Range</span>
                        <span className="font-black text-white uppercase italic text-sm">{currentAd.targetAudience.age || "Full Spectrum"}</span>
                      </div>
                      <div className="bg-white/3 border border-white/10 p-4 rounded-xl">
                        <span className="block text-[8px] text-white/30 font-black uppercase tracking-[0.4em] mb-2 italic">Gender</span>
                        <span className="font-black text-white uppercase italic text-sm">{currentAd.targetAudience.gender || "Omni"}</span>
                      </div>
                    </div>
                    <div className="bg-white/3 border border-white/10 p-4 rounded-xl">
                      <span className="block text-[8px] text-white/30 font-black uppercase tracking-[0.4em] mb-2 italic">Location</span>
                      <p className="font-black text-white uppercase italic text-xs tracking-tighter">{currentAd.targetAudience.location || "Default Terrain"}</p>
                    </div>
                    {currentAd.targetAudience.interests && (
                      <div>
                        <span className="block text-[8px] text-white/30 font-black uppercase tracking-[0.4em] mb-4 italic">Interests</span>
                        <div className="flex flex-wrap gap-2">
                          {currentAd.targetAudience.interests.map(i => (
                            <span key={i} className="px-3 py-1 bg-[#00F0FF]/5 border border-[#00F0FF]/20 text-[#00F0FF] text-[9px] font-black uppercase tracking-widest italic">{i}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Main Ad Copy Area */}
              <div className="bg-[#0A0A0C] border border-white/5 p-0 overflow-hidden flex flex-col md:flex-row rounded-xl relative">
                <div className="p-8 md:p-10 flex-1 border-r border-white/5">
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-[#FF0032]">description</span>
                       <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic">Ad Copy</h3>
                    </div>
                    <button className="text-white/20 hover:text-white transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic" onClick={() => handleCopy(currentAd.adCopy)}>
                      <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy Manifest
                    </button>
                  </div>
                  
                  <div className="bg-[#121214] p-8 border border-white/10 relative group mb-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF0032]/20 rounded-xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00F0FF]/20 rounded-xl pointer-events-none" />
                    
                    <p className="text-base font-bold leading-relaxed relative z-10 whitespace-pre-wrap text-white/80 italic tracking-tight">
                      {currentAd.adCopy}
                    </p>
                  </div>
                  
                  {currentAd.callToAction && (
                    <div className="flex items-center justify-between border-t border-white/5 pt-8">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Call to Action</span>
                      <button className="px-6 py-2.5 bg-[#FF0032] text-white rounded-xl font-medium shadow-md shadow-[#FF0032]/20 hover:shadow-lg hover:shadow-[#FF0032]/30 transition-all">
                        {currentAd.callToAction}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Right side snippet (Improvements or Creative Ideas) */}
                <div className="bg-[#121214]/50 md:w-80 p-8">
                  {currentAd.improvements ? (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]">legend_toggle</span>
                        <h4 className="font-black text-[10px] text-white uppercase tracking-[0.3em] italic">Efficiency Gains</h4>
                      </div>
                      <ul className="space-y-4">
                        {currentAd.improvements.map((imp, idx) => (
                          <li key={idx} className="flex gap-3 text-xs text-white/60 font-medium italic border-b border-white/5 pb-3 last:border-0">
                            <span className="material-symbols-outlined text-[16px] text-[#00F0FF]/40 italic">keyboard_double_arrow_right</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                      {currentAd.estimatedImpact && (
                         <div className="mt-8 p-5 bg-white/3 border border-white/10 rounded-xl">
                           <span className="block text-[8px] text-white/30 font-black uppercase tracking-[0.5em] mb-2 italic">Est. Magnitude</span>
                           <span className="text-[11px] font-black text-[#FF0032] uppercase italic tracking-widest">{currentAd.estimatedImpact}</span>
                         </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-[#FF0032] shadow-[0_0_10px_rgba(255,0,50,0.3)]">videocam</span>
                        <h4 className="font-black text-[10px] text-white uppercase tracking-[0.3em] italic">Visual Angles</h4>
                      </div>
                      <ul className="space-y-4">
                        {currentAd.creativeIdeas.map((idea, idx) => (
                          <li key={idx} className="bg-[#050505] p-4 rounded-xl border border-white/5 text-xs italic font-bold leading-relaxed shadow-lg text-white/50 hover:text-white transition-colors group">
                            <span className="inline-block px-2 py-0.5 bg-white/5 text-[#FF0032] text-[8px] font-black mb-3 border border-white/5">{String(idx+1).padStart(2, '0')}</span>
                            <p>{idea}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-[600px] bg-[#0A0A0C] border border-white/5 border-dashed flex flex-col items-center justify-center p-8 text-center rounded-xl cursor-pointer hover:bg-white/3 transition-all group" onClick={() => (document.querySelector('button[type="submit"]') as HTMLButtonElement)?.click()}>
              <div className="w-20 h-20 rounded-xl bg-white/3 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover:border-[#FF0032]/40 transition-all">
                <span className="material-symbols-outlined text-4xl text-white/10 group-hover:text-[#FF0032]/40 transition-all group-hover:scale-110">psychology</span>
              </div>
              <h3 className="text-2xl font-black font-serif text-white/60 mb-3 uppercase italic tracking-tighter">Standby for Synthesis</h3>
              <p className="text-white/50 max-w-sm text-[9px] font-black uppercase tracking-[0.4em] italic leading-loose">Initialize the creative protocol to generate high-velocity conversion artifacts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
