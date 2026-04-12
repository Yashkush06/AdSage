import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { useAppStore } from "../lib/store";
import { LoadingSpinner } from "../components/shared/LoadingStates";

type Step = "vision" | "pulse" | "strategy";

export function Onboarding() {
  const [step, setStep] = useState<Step>("vision");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();

  const [form, setForm] = useState({
    business_name: "",
    industry:      "",
    target_cpa:    "400",
    target_roas:   "3.0",
    strategy:      "Efficiency",
  });

  const steps: { id: Step; label: string; icon: string }[] = [
    { id: "vision",   label: "Core Vision", icon: "visibility" },
    { id: "pulse",    label: "Market Pulse", icon: "hub" },
    { id: "strategy", label: "Agent strategy", icon: "auto_awesome" },
  ];

  async function finish() {
    setLoading(true);
    setError("");
    try {
      await authApi.updateProfile({
        business_name: form.business_name || "CodePunk Studio",
        industry:      form.industry || "E-commerce",
        target_cpa:    parseFloat(form.target_cpa) || 400,
        target_roas:   parseFloat(form.target_roas) || 3.0,
        strategy:      form.strategy || "Efficiency",
      });

      const meRes = await authApi.me();
      setUser(meRes.data);
      setOnboarded(true);
      navigate("/");
    } catch (e: any) {
      const detail = e?.response?.data?.detail || e?.message || "unknown error";
      setError(`Synchronisation with the Observatory failed: ${detail}`);
      console.error("[Onboarding] finish() error:", e?.response ?? e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 md:p-12 font-body overflow-hidden">
      <div className="w-full max-w-5xl bg-[#050505] rounded-none border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex overflow-hidden lg:h-[700px] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF0032] via-[#00F0FF] to-[#FF0032] opacity-50" />
        
        {/* Step Navigation Sidebar */}
        <aside className="w-64 bg-[#0A0A0C] border-r border-white/5 p-10 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-16 group cursor-pointer">
            <div className="w-12 h-12 rounded-none bg-[#FF0032] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,50,0.3)] hover-glitch transition-all">
              <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-black text-white italic leading-none tracking-tighter uppercase">AdSage</h1>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#00F0FF] mt-1">Verse Alpha</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-10 italic">Neural Calibration Cycle</p>
             {steps.map((s, i) => (
                <div 
                  key={s.id} 
                  className={`flex items-center gap-5 group transition-all duration-500 ${step === s.id ? 'opacity-100 translate-x-1' : 'opacity-50 hover:opacity-80'}`}
                >
                   <div className={`w-8 h-8 rounded-none border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                     step === s.id ? 'border-[#FF0032] bg-[#FF0032] text-white shadow-[0_0_15px_rgba(255,0,50,0.3)]' : 'border-white/20 text-white/50'
                   }`}>
                      {i + 1}
                   </div>
                   <div className="flex flex-col">
                      <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${step === s.id ? 'text-[#00F0FF]' : 'text-white/50'}`}>
                        {s.label}
                      </span>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-auto">
             <p className="text-[10px] text-[#FDA481]/40 font-medium leading-relaxed">
               Welcome to the Observatory. <br/>
               Our agents will guide your marketing evolution.
             </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 md:p-16 flex flex-col relative overflow-y-auto">
          
          <div className="flex-1 animate-fade-in max-w-md mx-auto w-full flex flex-col justify-center">
            
            {step === "vision" && (
              <div className="space-y-10 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-serif text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Establish Node</h2>
                  <p className="text-[#00F0FF]/60 font-bold uppercase tracking-[0.25em] text-[10px]">Identify the business origin point.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em]">Directive Alias</label>
                    <input 
                      className="w-full bg-[#121214] border border-white/10 rounded-none px-6 py-5 outline-none focus:border-[#FF0032] focus:ring-1 focus:ring-[#FF0032] transition-all font-bold text-white uppercase placeholder:text-white/10 text-sm italic"
                      placeholder="e.g. STERLING ARCHIVAL"
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em]">Market Frequency</label>
                    <select 
                      className="w-full bg-[#121214] border border-white/10 rounded-none px-6 py-5 outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all font-bold text-white appearance-none uppercase italic text-sm"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    >
                       <option value="">Select industry scope...</option>
                       {["E-commerce", "SaaS", "Fashion", "Electronics", "Architecture", "Luxury Goods"].map(i => <option key={i} value={i} className="bg-[#121214]">{i}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => setStep("pulse")}
                  className="w-full py-5 bg-[#FF0032] text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_0_25px_rgba(255,0,50,0.4)] hover-glitch transition-all flex items-center justify-center gap-3"
                >
                  Initiate Frequency Check
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </button>
              </div>
            )}

            {step === "pulse" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl font-black tracking-tighter text-white uppercase italic">Set the Pulse</h2>
                  <p className="text-[#00F0FF]/40 font-black uppercase tracking-[0.2em] text-[10px] italic">Define your acceptable performance thresholds.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em] italic">Target CPA (₹)</label>
                    <input 
                      type="number"
                      className="w-full bg-[#121214] border border-white/10 rounded-none px-6 py-4 outline-none focus:border-[#FF0032] transition-all font-black text-white uppercase italic shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                      placeholder="400"
                      value={form.target_cpa}
                      onChange={(e) => setForm({ ...form, target_cpa: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.4em] italic">Minimum ROAS (x)</label>
                    <input 
                      type="number"
                      step="0.1"
                      className="w-full bg-[#121214] border border-white/10 rounded-none px-6 py-4 outline-none focus:border-[#FF0032] transition-all font-black text-white uppercase italic shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                      placeholder="3.0"
                      value={form.target_roas}
                      onChange={(e) => setForm({ ...form, target_roas: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep("vision")} className="flex-1 py-4 bg-white/5 text-white/30 rounded-none font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white/10 transition-all italic border border-white/5">Back</button>
                   <button 
                     onClick={() => setStep("strategy")}
                     className="flex-[2] py-4 bg-[#FF0032] text-white rounded-none font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_0_30px_rgba(255,0,50,0.3)] hover-glitch transition-all flex items-center justify-center gap-2 italic"
                   >
                     Continue Node
                     <span className="material-symbols-outlined text-lg">arrow_forward</span>
                   </button>
                </div>
              </div>
            )}

            {step === "strategy" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl font-black tracking-tighter text-white uppercase italic">Select Strategy</h2>
                  <p className="text-[#00F0FF]/40 font-black uppercase tracking-[0.2em] text-[10px] italic">How should our agents manage your archives?</p>
                </div>

                <div className="space-y-4">
                   {[
                     { name: 'Stability', icon: 'balance', desc: 'Prioritize consistent ROAS over volume.' },
                     { name: 'Efficiency', icon: 'energy_savings_leaf', desc: 'Optimize spend relative to conversion value.' },
                     { name: 'Expansion', icon: 'shutter_speed', desc: 'Aggressive scaling of winning creative assets.' }
                   ].map(s => (
                        <div 
                          key={s.name}
                          onClick={() => setForm({...form, strategy: s.name})}
                          className={`p-6 rounded-none border-2 transition-all cursor-pointer flex items-center gap-6 ${
                            form.strategy === s.name ? 'border-[#FF0032] bg-[#FF0032]/5' : 'border-white/5 hover:border-white/20'
                          }`}
                        >
                           <div className={`w-12 h-12 rounded-none flex items-center justify-center ${form.strategy === s.name ? 'bg-[#FF0032] text-white' : 'bg-[#121214] text-[#00F0FF]/40'}`}>
                              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                           </div>
                        <div className="flex-1">
                           <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${form.strategy === s.name ? 'text-[#00F0FF]' : 'text-white/40'}`}>{s.name}</p>
                           <p className="text-[10px] text-white/20 leading-tight uppercase font-bold mt-1">{s.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {error && <p className="text-[#B4182D] text-xs font-bold bg-[#B4182D]/10 p-4 rounded-xl border border-[#B4182D]/20">{error}</p>}

                <div className="flex gap-4 pt-4">
                   <button onClick={() => setStep("pulse")} className="flex-1 py-4 bg-[#242E49] text-[#FDA481]/60 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#37415C] transition-colors">Back</button>
                   <button 
                     onClick={finish}
                     disabled={loading}
                     className="flex-[2] py-4 bg-[#FDA481] text-[#181A2F] rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-[#FDA481]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                   >
                     {loading ? <LoadingSpinner size={16} /> : 'Activate Observatory'}
                   </button>
                </div>
              </div>
            )}

          </div>

          <footer className="mt-auto pt-16 flex justify-between items-center text-[9px] font-black text-white/10 uppercase tracking-[0.5em] italic">
            <span>© 2026 Spider-Verse Intelligence Network</span>
            <div className="flex gap-12">
              <span className="text-[#00F0FF]/20 hover:text-[#00F0FF] cursor-pointer transition-colors">Neural Security Protocol</span>
              <span className="text-[#FF0032]/20 hover:text-[#FF0032] cursor-pointer transition-colors">Ecosystem Encrypted</span>
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
}
