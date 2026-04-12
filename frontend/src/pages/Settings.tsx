import { useState } from "react";
import { useAppStore } from "../lib/store";
import { authApi, campaignsApi } from "../lib/api";
import { LoadingSpinner } from "../components/shared/LoadingStates";
import { Header } from "../components/shared/Header";

export function Settings() {
  const { user, setUser } = useAppStore();
  const [form, setForm] = useState({
    business_name:  user?.business_name  || "",
    industry:       user?.industry       || "",
    target_cpa:     String(user?.target_cpa    || 400),
    target_roas:    String(user?.target_roas   || 3.0),
    monthly_budget: String(user?.monthly_budget || ""),
  });
  const [saving,   setSaving]  = useState(false);
  const [msg,      setMsg]     = useState("");
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
      setSimMsg(`✓ ${simHours}h time dilation complete`);
    } catch {
      setSimMsg("Simulation failed");
    }
    setSimming(false);
    setTimeout(() => setSimMsg(""), 5000);
  }

  const field = (label: string, key: keyof typeof form, type = "text", hint?: string) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-black text-white/30 tracking-[0.4em] italic">{label}</label>
      <input
        className="w-full bg-[#0d0d0f] border border-white/10 rounded-none px-4 py-3 outline-none focus:border-[#FF0032]/50 focus:ring-1 focus:ring-[#FF0032]/20 transition-all font-bold text-white/80 text-sm placeholder:text-white/20"
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {hint && <p className="text-[10px] text-white/20 italic">Directive: {hint}</p>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      <Header title="Observatory Settings" subtitle="Ecosystem Configuration" />

      <main className="p-8 max-w-2xl mx-auto space-y-8 animate-fade-in w-full pb-20">

        <div className="space-y-1">
          <h2 className="font-serif text-4xl font-black tracking-tighter text-white uppercase italic">Configuration</h2>
          <p className="text-white/30 font-black text-[11px] uppercase tracking-[0.3em]">Fine-tuning the parameters of your agent network.</p>
        </div>

        {/* Business profile */}
        <section className="bg-[#0a0a0c] border border-white/8 rounded-none p-8 space-y-8">
          <div className="flex items-center gap-3 text-[#FF0032]">
            <span className="material-symbols-outlined text-xl">identity_platform</span>
            <h3 className="font-serif text-xl font-black italic uppercase tracking-tighter">Business Core</h3>
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

          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 py-4 bg-[#FF0032] text-white rounded-none text-[10px] font-black uppercase tracking-[0.4em] italic shadow-[0_0_20px_rgba(255,0,50,0.3)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {saving ? <LoadingSpinner size={16} /> : <span className="material-symbols-outlined text-lg">save</span>}
              Save Parameters
            </button>
            {msg && <span className="text-xs font-black text-[#00F0FF] animate-fade-in uppercase tracking-widest">{msg}</span>}
          </div>
        </section>

        {/* Temporal Simulation */}
        <section className="bg-[#0a0a0c] border border-white/8 rounded-none p-8 space-y-6">
          <div className="flex items-center gap-3 text-white/40">
            <span className="material-symbols-outlined text-xl">timelapse</span>
            <h3 className="font-serif text-xl font-black italic uppercase tracking-tighter text-white/60">Time Dilation</h3>
          </div>
          <p className="text-sm text-white/30 leading-relaxed max-w-md font-medium">
            Accelerate the ecosystem to observe agent decisions and campaign evolution in the simulated market.
          </p>

          <div className="flex items-center gap-4">
            <select
              className="bg-[#0d0d0f] border border-white/10 text-white/60 text-sm font-black uppercase italic px-4 py-3 outline-none focus:border-[#FF0032]/50 transition-all rounded-none appearance-none"
              value={simHours}
              onChange={(e) => setSimHours(Number(e.target.value))}
            >
              {[1, 4, 8, 24, 48].map((h) => (
                <option key={h} value={h} className="bg-[#0d0d0f]">{h} hour{h > 1 ? "s" : ""}</option>
              ))}
            </select>
            <button
              onClick={simulate}
              disabled={simming}
              className="flex-[2] py-4 bg-white/5 border border-white/10 text-white/50 rounded-none text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {simming ? <LoadingSpinner size={14} /> : <span className="material-symbols-outlined text-lg">fast_forward</span>}
              Simulate Shift
            </button>
          </div>
          {simMsg && <p className="text-xs font-black text-[#00F0FF] animate-fade-in uppercase tracking-widest">{simMsg}</p>}
        </section>

        {/* Security */}
        <div className="p-6 bg-[#FF0032]/5 border border-[#FF0032]/20 rounded-none flex items-start gap-4">
          <span className="material-symbols-outlined text-[#FF0032] text-lg">security</span>
          <p className="text-[10px] text-white/30 font-black leading-relaxed uppercase tracking-wider">
            Observatory Security: All business parameters are locally encrypted. This session is in <strong className="text-white/50">Simulation Mode</strong>. No real-world financial consequences are active.
          </p>
        </div>

      </main>
    </div>
  );
}
