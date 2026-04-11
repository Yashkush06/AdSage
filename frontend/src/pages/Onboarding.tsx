import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { useAppStore } from "../lib/store";
import { LoadingSpinner } from "../components/shared/LoadingStates";
import { Zap, ArrowRight } from "lucide-react";

type Step = "welcome" | "business" | "goals";

export function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, setOnboarded } = useAppStore();

  const [form, setForm] = useState({
    business_name: "",
    industry:      "",
    target_cpa:    "400",
    target_roas:   "3.0",
  });

  function f(label: string, key: keyof typeof form, type = "text", placeholder = "") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
        <input
          className="input"
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      </div>
    );
  }

  async function finish() {
    setLoading(true);
    setError("");
    try {
      // Update the demo user's profile with the entered goals
      await authApi.updateProfile({
        business_name: form.business_name || "Demo Store",
        industry:      form.industry || "E-commerce",
        target_cpa:    parseFloat(form.target_cpa) || 400,
        target_roas:   parseFloat(form.target_roas) || 3.0,
      });

      // Fetch the updated user
      const meRes = await authApi.me();
      setUser(meRes.data);
      setOnboarded(true);
      navigate("/");
    } catch (e: any) {
      setError("Could not reach backend. Make sure the server is running on port 8000.");
    }
    setLoading(false);
  }

  const steps: Step[] = ["welcome", "business", "goals"];
  const stepIdx = steps.indexOf(step);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        backgroundImage: "radial-gradient(ellipse at top, rgba(99,102,241,0.12) 0%, transparent 60%)",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem",
              boxShadow: "0 0 24px rgba(99,102,241,0.4)",
            }}
          >
            <Zap size={24} color="white" />
          </div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>
            AdSage
          </h1>
          <p style={{ margin: "0.375rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            AI-powered Meta Ads Manager
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem" }}>
          {steps.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= stepIdx ? "var(--accent-blue)" : "rgba(255,255,255,0.08)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <div className="glass-card" style={{ padding: "2rem" }}>
          {/* Step 1: Welcome */}
          {step === "welcome" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Welcome to AdSage
              </h2>
              <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7 }}>
                Three AI agents autonomously optimize your Meta Ads — with your approval at every step.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {[
                  { emoji: "🔍", title: "Performance Detective", desc: "Flags underperforming campaigns" },
                  { emoji: "💰", title: "Budget Strategist",     desc: "Reallocates budgets to maximize ROAS" },
                  { emoji: "🚀", title: "Growth Executor",       desc: "Scales and duplicates winning campaigns" },
                ].map((a) => (
                  <div
                    key={a.title}
                    style={{
                      display: "flex", gap: "0.875rem", alignItems: "flex-start",
                      padding: "0.75rem", borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{a.emoji}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{a.title}</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: "0.75rem", borderRadius: 10,
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#818cf8" }}>
                  🎭 <strong>Demo mode</strong> — using realistic simulated campaign data. No real Meta API needed.
                </p>
              </div>
              <button className="btn-primary" onClick={() => setStep("business")} id="onboarding-start-btn">
                Get Started <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 2: Business */}
          {step === "business" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Tell us about your business
              </h2>
              {f("Business Name", "business_name", "text", "e.g. CodePunk Store")}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>Industry</label>
                <select
                  className="input"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                >
                  <option value="">Select industry…</option>
                  {["E-commerce", "Fashion", "Electronics", "FMCG", "EdTech", "SaaS", "Real Estate", "Other"].map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <button className="btn-primary" onClick={() => setStep("goals")}>
                Continue <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === "goals" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Set your performance targets
              </h2>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Agents use these thresholds to decide when to alert, pause, or scale campaigns.
              </p>
              {f("Target CPA (₹)", "target_cpa", "number", "400")}
              {f("Target ROAS (x)", "target_roas", "number", "3.0")}
              {error && (
                <p style={{
                  margin: 0, color: "#f87171", fontSize: "0.82rem",
                  padding: "0.625rem 0.75rem",
                  background: "rgba(239,68,68,0.1)", borderRadius: 8,
                }}>
                  {error}
                </p>
              )}
              <button
                className="btn-primary"
                onClick={finish}
                disabled={loading}
                id="onboarding-finish-btn"
              >
                {loading ? <LoadingSpinner size={14} /> : <Zap size={14} />}
                {loading ? "Setting up…" : "Launch Dashboard"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
