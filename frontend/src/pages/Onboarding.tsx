import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { useAppStore } from "../lib/store";
import { LoadingSpinner } from "../components/shared/LoadingStates";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 md:p-12 font-body text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl glass-card flex flex-col md:flex-row overflow-hidden lg:h-[700px] border-white/5"
      >
        
        {/* Step Navigation Sidebar */}
        <aside className="w-64 bg-[#0b0c11] border-r border-outline-variant/10 p-8 hidden md:flex flex-col">
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

          <div className="mt-auto p-4 bg-primary/10 rounded-2xl border border-primary/20">
             <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">Observatory Status</p>
             <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
               Syncing with market agents... <br/>
               Ready for vision establishment.
             </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 md:p-16 flex flex-col relative overflow-y-auto">
          
          <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {step === "vision" && (
                <motion.div 
                  key="vision"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Establish Vision</h2>
                    <p className="text-stone-500 font-medium">Tell us about your business baseline.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Business Name</label>
                      <input 
                        className="input"
                        placeholder="e.g. Sterling Archival Studio"
                        value={form.business_name}
                        onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Primary Industry</label>
                      <select 
                        className="input appearance-none"
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      >
                         <option value="">Select industry scope...</option>
                         {["E-commerce", "SaaS", "Fashion", "Electronics", "Architecture", "Luxury Goods"].map(i => <option key={i} value={i} className="bg-surface">{i}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep("pulse")}
                    className="btn-primary w-full py-4 text-xs tracking-[0.2em] uppercase"
                  >
                    Continue Pulse Check
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </motion.div>
              )}

              {step === "pulse" && (
                <motion.div 
                  key="pulse"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Set the Pulse</h2>
                    <p className="text-stone-500 font-medium">Define your acceptable performance thresholds.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Target CPA (₹)</label>
                      <input 
                        type="number"
                        className="input"
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
                        className="input"
                        placeholder="3.0"
                        value={form.target_roas}
                        onChange={(e) => setForm({ ...form, target_roas: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                     <button onClick={() => setStep("vision")} className="flex-1 py-4 bg-white/5 text-stone-400 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">Back</button>
                     <button 
                       onClick={() => setStep("strategy")}
                       className="btn-primary flex-[2] text-xs uppercase tracking-[0.2em]"
                     >
                       Calibrate Strategy
                     </button>
                  </div>
                </motion.div>
              )}

              {step === "strategy" && (
                <motion.div 
                  key="strategy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
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
                           form.strategy === s.name ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' : 'border-white/5 bg-white/5 hover:border-white/10'
                         }`}
                       >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${form.strategy === s.name ? 'bg-primary text-white' : 'bg-white/5 text-stone-500'}`}>
                             <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                          </div>
                          <div className="flex-1">
                             <p className={`text-sm font-bold ${form.strategy === s.name ? 'text-primary' : 'text-on-surface'}`}>{s.name}</p>
                             <p className="text-[11px] text-stone-500 leading-tight">{s.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  {error && <p className="text-error text-xs font-bold bg-error/10 p-4 rounded-xl">{error}</p>}

                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setStep("pulse")} className="flex-1 py-4 bg-white/5 text-stone-400 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</button>
                     <button 
                       onClick={finish}
                       disabled={loading}
                       className="btn-primary flex-[2] text-xs uppercase tracking-[0.2em]"
                     >
                       {loading ? <LoadingSpinner size={16} /> : 'Activate Observatory'}
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          <footer className="mt-auto pt-16 flex justify-between items-center text-[10px] font-bold text-stone-500 uppercase tracking-widest">
            <span>© 2026 AdSage AI</span>
            <div className="flex gap-4">
              <span>Security Protocol</span>
              <span>Encrypted</span>
            </div>
          </footer>
        </main>

      </motion.div>
    </div>
  );
}
