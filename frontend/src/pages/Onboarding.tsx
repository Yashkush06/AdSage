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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 md:p-12 font-body">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 shadow-2xl flex overflow-hidden lg:h-[700px]">
        
        {/* Step Navigation Sidebar */}
        <aside className="w-64 bg-surface-container-low border-r border-outline-variant/10 p-8 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">temp_preferences_eco</span>
            </div>
            <h1 className="font-serif text-xl font-bold text-primary">AdSage</h1>
          </div>

          <div className="space-y-4 flex-1">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-8">Onboarding Cycle</p>
             {steps.map((s, i) => (
                <div 
                  key={s.id} 
                  className={`flex items-center gap-4 group transition-all duration-300 ${step === s.id ? 'opacity-100' : 'opacity-40'}`}
                >
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                     step === s.id ? 'border-primary bg-primary text-white' : 'border-stone-300 text-stone-300'
                   }`}>
                      {i + 1}
                   </div>
                   <div className="flex flex-col">
                      <span className={`text-[12px] font-bold uppercase tracking-widest ${step === s.id ? 'text-primary' : 'text-stone-400'}`}>
                        {s.label}
                      </span>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-auto">
             <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
               Welcome to the Observatory. <br/>
               Our agents will guide your marketing evolution.
             </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 md:p-16 flex flex-col relative overflow-y-auto">
          
          <div className="flex-1 animate-fade-in max-w-md mx-auto w-full flex flex-col justify-center">
            
            {step === "vision" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Establish Vision</h2>
                  <p className="text-stone-500 font-medium">Tell us about your business baseline.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Business Name</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface"
                      placeholder="e.g. Sterling Archival Studio"
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Primary Industry</label>
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface appearance-none"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    >
                       <option value="">Select industry scope...</option>
                       {["E-commerce", "SaaS", "Fashion", "Electronics", "Architecture", "Luxury Goods"].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => setStep("pulse")}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Continue Pulse Check
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}

            {step === "pulse" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Set the Pulse</h2>
                  <p className="text-stone-500 font-medium">Define your acceptable performance thresholds.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Target CPA (₹)</label>
                    <input 
                      type="number"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface"
                      placeholder="400"
                      value={form.target_cpa}
                      onChange={(e) => setForm({ ...form, target_cpa: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Minimum ROAS (x)</label>
                    <input 
                      type="number"
                      step="0.1"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface"
                      placeholder="3.0"
                      value={form.target_roas}
                      onChange={(e) => setForm({ ...form, target_roas: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep("vision")} className="flex-1 py-4 bg-surface-container-high text-stone-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-200 transition-colors">Back</button>
                   <button 
                     onClick={() => setStep("strategy")}
                     className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                   >
                     Calibrate Strategy
                   </button>
                </div>
              </div>
            )}

            {step === "strategy" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Select Strategy</h2>
                  <p className="text-stone-500 font-medium">How should our agents manage your archives?</p>
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
                       className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 ${
                         form.strategy === s.name ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:border-outline-variant/50'
                       }`}
                     >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${form.strategy === s.name ? 'bg-primary text-white' : 'bg-surface-container-high text-stone-400'}`}>
                           <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                        </div>
                        <div className="flex-1">
                           <p className={`text-sm font-bold ${form.strategy === s.name ? 'text-primary' : 'text-on-surface'}`}>{s.name}</p>
                           <p className="text-[11px] text-stone-500 leading-tight">{s.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {error && <p className="text-error text-xs font-bold bg-error-container/20 p-4 rounded-xl">{error}</p>}

                <div className="flex gap-4 pt-4">
                   <button onClick={() => setStep("pulse")} className="flex-1 py-4 bg-surface-container-high text-stone-600 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</button>
                   <button 
                     onClick={finish}
                     disabled={loading}
                     className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                   >
                     {loading ? <LoadingSpinner size={16} /> : 'Activate Observatory'}
                   </button>
                </div>
              </div>
            )}

          </div>

          <footer className="mt-auto pt-16 flex justify-between items-center text-[10px] font-bold text-stone-300 uppercase tracking-widest">
            <span>© 2026 AdSage AI</span>
            <div className="flex gap-4">
              <span>Security Protocol</span>
              <span>Encrypted</span>
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
}
