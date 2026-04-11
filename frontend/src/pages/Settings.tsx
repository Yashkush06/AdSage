import { useState } from "react";
import { useAppStore } from "../lib/store";
import { authApi, campaignsApi } from "../lib/api";
import { LoadingSpinner } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";

export function Settings() {
  const { user, setUser, performanceMode } = useAppStore();
  const [form, setForm] = useState({
    business_name: user?.business_name || "",
    industry:      user?.industry || "",
    target_cpa:    String(user?.target_cpa || 400),
    target_roas:   String(user?.target_roas || 3.0),
    monthly_budget: String(user?.monthly_budget || ""),
  });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");
  const [simHours, setSimHours] = useState(4);
  const [simming,  setSimming]  = useState(false);
  const [simMsg,   setSimMsg]   = useState("");

  async function save() {
    setSaving(true);
    try {
      await authApi.updateProfile({
        business_name:  form.business_name,
        industry:       form.industry,
        target_cpa:     parseFloat(form.target_cpa),
        target_roas:    parseFloat(form.target_roas),
        monthly_budget: form.monthly_budget ? parseFloat(form.monthly_budget) : undefined,
      });
      const meRes = await authApi.me();
      setUser(meRes.data);
      setMsg("✓ Protocol Updated");
    } catch {
      setMsg("Update failed");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function simulate() {
    setSimming(true);
    try {
      await campaignsApi.simulateTime(simHours);
      setSimMsg(`✓ {simHours}h time dilation complete`);
    } catch {
      setSimMsg("Simulation failed");
    }
    setSimming(false);
    setTimeout(() => setSimMsg(""), 5000);
  }

  const field = (label: string, key: keyof typeof form, type = "text", hint?: string) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">{label}</label>
      <input
        className="w-full bg-[#1a1c24] border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-white"
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {hint && <p className="text-[10px] text-stone-400 italic">Directive: {hint}</p>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Observatory Settings" subtitle="Ecosystem Configuration" />
      
      <main className="p-8 max-w-2xl mx-auto space-y-12 animate-fade-in w-full pb-20">
        
        <div className="space-y-1">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-on-surface">Configuration</h2>
          <p className="text-stone-500 font-medium">Fine-tuning the parameters of your agent network.</p>
        </div>

        {/* Business profile */}
        <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-8">
           <div className="flex items-center gap-2 text-primary mb-4">
              <span className="material-symbols-outlined text-xl">identity_platform</span>
              <h3 className="font-serif text-xl font-bold">Business Core</h3>
           </div>
           
           <div className="space-y-6">
             {field("Business Name", "business_name")}
             {field("Industry Vector", "industry")}
             
             <div className="grid grid-cols-2 gap-6">
               {field("Target CPA (₹)", "target_cpa", "number", "Agent pause threshold")}
               {field("Target ROAS (x)", "target_roas", "number", "Agent scale threshold")}
             </div>

             {field("Monthly Budget (₹)", "monthly_budget", "number")}
           </div>

           <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/10">
             <button 
               onClick={save} 
               disabled={saving}
               className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
             >
               {saving ? <LoadingSpinner size={16} /> : <span className="material-symbols-outlined text-lg">save</span>}
               Save Parameters
             </button>
             {msg && <span className="text-xs font-bold text-primary animate-fade-in">{msg}</span>}
           </div>
        </section>

        {/* Temporal Simulation */}
        <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
           <div className="flex items-center gap-2 text-stone-600 mb-2">
              <span className="material-symbols-outlined text-xl">timelapse</span>
              <h3 className="font-serif text-xl font-bold">Time Dilation</h3>
           </div>
           <p className="text-sm text-stone-500 leading-relaxed max-w-md">
             Accelerate the ecosystem to observe agent decisions and campaign evolution in the simulated market.
           </p>
           
           <div className="flex items-center gap-4">
              <select
                className="bg-[#1a1c24] border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-white"
                value={simHours}
                onChange={(e) => setSimHours(Number(e.target.value))}
              >
                {[1, 4, 8, 24, 48].map((h) => (
                  <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
                ))}
              </select>
              <button 
                onClick={simulate} 
                disabled={simming}
                className="flex-[2] py-4 bg-surface-container border border-outline-variant/30 text-stone-400 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-surface-container-high hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                {simming ? <LoadingSpinner size={14} /> : <span className="material-symbols-outlined text-lg">fast_forward</span>}
                Simulate Shift
              </button>
           </div>
           {simMsg && <p className="text-xs font-bold text-primary animate-fade-in">{simMsg}</p>}
        </section>

        {/* Performance / Fidelity */}
        <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
           <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-xl">speed</span>
              <h3 className="font-serif text-xl font-bold">Observatory Fidelity</h3>
           </div>
           <p className="text-sm text-stone-500 leading-relaxed max-w-md">
             Adjust the rendering density of the 3D ecosystem. "Auto" will dynamically scale based on your hardware.
           </p>
           
           <div className="flex bg-[#1a1c24] p-1 rounded-xl border border-outline-variant/20">
              {(['auto', 'low', 'high'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    const { setPerformanceMode } = useAppStore.getState();
                    setPerformanceMode(mode);
                  }}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    performanceMode === mode 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
           </div>
        </section>

        {/* Security / Info */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
           <span className="material-symbols-outlined text-primary">security</span>
           <p className="text-[10px] text-stone-500 font-medium leading-relaxed uppercase tracking-wider">
             Observatory Security: All business parameters are locally encrypted. This session is in <strong>Simulation Mode</strong>. No real-world financial consequences are active.
           </p>
        </div>

      </main>
    </div>
  );
}
