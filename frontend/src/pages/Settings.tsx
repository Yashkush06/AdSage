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
    <div className="space-y-3 group">
      <label className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em] group-focus-within:text-[#FF0032] transition-colors">{label}</label>
      <input
        className="input font-bold"
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {hint && <p className="text-[9px] text-[#00F0FF]/50 italic font-bold tracking-[0.2em] uppercase">Directive: {hint}</p>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-[#FF0032] selection:text-white">
      <Header title="Observatory Settings" subtitle="Ecosystem Configuration" />

      <main className="p-8 max-w-4xl mx-auto space-y-12 animate-fade-in w-full pb-20">

        <div className="space-y-1">
          <h2 className="font-serif text-5xl font-black tracking-tighter uppercase italic leading-none">Configuration</h2>
          <p className="text-[#00F0FF]/60 font-bold uppercase tracking-[0.25em] text-[10px]">Fine-tuning the parameters of your agent network.</p>
        </div>

        {/* Business profile */}
        <section className="glass-card p-10 space-y-10 relative overflow-hidden group/card shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF0032] via-[#00F0FF] to-[#FF0032] opacity-30 group-hover/card:opacity-100 transition-opacity duration-700" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#FF0032]/5 blur-3xl rounded-full" />

          <div className="flex items-center gap-4 text-white relative z-10">
            <div className="w-12 h-12 rounded-none bg-[#FF0032]/10 border border-[#FF0032]/30 flex items-center justify-center text-[#FF0032] shadow-[0_0_15px_rgba(255,0,50,0.2)]">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-black uppercase italic tracking-tighter">Business Core</h3>
              <p className="text-[#FF0032]/60 font-black uppercase tracking-[0.2em] text-[8px] mt-1">Primary Directives</p>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {field("Business Name", "business_name")}
              {field("Industry Vector", "industry")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {field("Target CPA (₹)", "target_cpa", "number", "Agent pause threshold")}
              {field("Target ROAS (x)", "target_roas", "number", "Agent scale threshold")}
              {field("Monthly Budget (₹)", "monthly_budget", "number")}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-white/5 relative z-10">
            <button
              onClick={save}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? <LoadingSpinner size={16} /> : <span className="material-symbols-outlined text-lg">save</span>}
              Save Parameters
            </button>
            {msg && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00F0FF] animate-fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified</span> {msg}
              </span>
            )}
          </div>
        </section>

        {/* Temporal Simulation */}
        <section className="glass-card p-10 space-y-8 relative overflow-hidden group/card shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F0FF] via-[#FF0032] to-[#00F0FF] opacity-30 group-hover/card:opacity-100 transition-opacity duration-700" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#00F0FF]/5 blur-3xl rounded-full" />

          <div className="flex items-center gap-4 text-white relative z-10">
            <div className="w-12 h-12 rounded-none bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <span className="material-symbols-outlined text-2xl">timelapse</span>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-black uppercase italic tracking-tighter">Time Dilation</h3>
              <p className="text-[#00F0FF]/60 font-black uppercase tracking-[0.2em] text-[8px] mt-1">Simulated Market Evolution</p>
            </div>
          </div>

          <div className="flex items-end gap-6 relative z-10 max-w-xl">
            <div className="space-y-3 flex-[2]">
              <label className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em]">Temporal Scope</label>
              <div className="relative">
                <select
                  className="input cursor-pointer font-bold appearance-none w-full pr-10"
                  value={simHours}
                  onChange={(e) => setSimHours(Number(e.target.value))}
                >
                  {[1, 4, 8, 24, 48].map((h) => (
                    <option key={h} value={h} className="bg-[#121214] text-white">
                      Forward {h} hour{h > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">expand_more</span>
              </div>
            </div>
            <button
              onClick={simulate}
              disabled={simming}
              className="btn-secondary flex-1 py-3 h-[46px]"
            >
              {simming ? <LoadingSpinner size={14} /> : <span className="material-symbols-outlined text-lg">fast_forward</span>}
              Initiate
            </button>
          </div>
          {simMsg && (
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00F0FF] animate-fade-in flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-sm">update</span> {simMsg}
            </p>
          )}
        </section>

        {/* Security / Info */}
        <div className="p-6 bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-none flex items-start gap-5 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
          <span className="material-symbols-outlined text-[#00F0FF] text-3xl opacity-80">local_police</span>
          <div>
            <h4 className="text-[11px] font-black text-[#00F0FF] uppercase tracking-[0.3em] mb-1">Observatory Security Protocol</h4>
            <p className="text-[10px] text-white/50 font-bold leading-relaxed uppercase tracking-widest">
              All business parameters are locally encrypted. This session is operating in{" "}
              <strong className="text-white">Simulation Mode</strong>. No real-world financial consequences are active during phase tests.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
