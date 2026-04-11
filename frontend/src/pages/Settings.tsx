import { useState } from "react";
import { useAppStore } from "../lib/store";
import { authApi, campaignsApi } from "../lib/api";
import { LoadingSpinner } from "../components/shared/LoadingStates";
import { Save, FastForward } from "lucide-react";

export function Settings() {
  const { user, setUser } = useAppStore();
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
      setMsg("✓ Saved");
    } catch {
      setMsg("Save failed");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function simulate() {
    setSimming(true);
    try {
      await campaignsApi.simulateTime(simHours);
      setSimMsg(`✓ Simulated ${simHours}h of progression`);
    } catch {
      setSimMsg("Simulation failed");
    }
    setSimming(false);
    setTimeout(() => setSimMsg(""), 5000);
  }

  const field = (label: string, key: keyof typeof form, type = "text", hint?: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
      <input
        className="input"
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {hint && <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-faint)" }}>{hint}</p>}
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: 600, display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="gradient-text" style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Settings</h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Business profile and agent thresholds
        </p>
      </div>

      {/* Business profile */}
      <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
          Business Profile
        </h2>
        {field("Business Name", "business_name")}
        {field("Industry", "industry")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {field("Target CPA (₹)", "target_cpa",   "number", "Agents pause campaigns exceeding 3× this")}
          {field("Target ROAS",    "target_roas",  "number", "Agents scale campaigns above 3.5×")}
        </div>
        {field("Monthly Budget (₹)", "monthly_budget", "number")}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="btn-primary" onClick={save} disabled={saving} id="save-settings-btn">
            {saving ? <LoadingSpinner size={14} /> : <Save size={14} />}
            Save Changes
          </button>
          {msg && <span style={{ fontSize: "0.8rem", color: "#10b981" }}>{msg}</span>}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
          Demo Controls
        </h2>
        <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          Simulate time passing — improving campaigns will show better metrics, declining ones get worse.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            className="input"
            value={simHours}
            onChange={(e) => setSimHours(Number(e.target.value))}
            style={{ width: 140 }}
          >
            {[1, 4, 8, 24, 48].map((h) => (
              <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>
            ))}
          </select>
          <button className="btn-ghost" onClick={simulate} disabled={simming}>
            {simming ? <LoadingSpinner size={14} /> : <FastForward size={14} />}
            Simulate
          </button>
          {simMsg && <span style={{ fontSize: "0.8rem", color: "#10b981" }}>{simMsg}</span>}
        </div>
      </div>

      {/* Mode badge */}
      <div style={{ padding: "0.75rem 1rem", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#818cf8" }}>
          🎭 <strong>Hackathon Demo Mode</strong> — no real Meta API, no authentication required.
          All campaign data is simulated.
        </p>
      </div>
    </div>
  );
}
