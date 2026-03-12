

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Leaf, ArrowRight, CheckCircle2, Sun, Moon } from "lucide-react";
import { authAPI } from "../services/api";
import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Btn, Input, ErrBox } from "../components/ui";

// ── Shared split layout ───────────────────────────────────────────────────────
function AuthShell({ title, subtitle, children }) {
  const { dark, toggle } = useTheme();
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-leaf-600 dark:bg-leaf-900 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 2px, transparent 0)", backgroundSize: "50px 50px" }} />
        {/* Floating shapes */}
        <div className="absolute top-16 left-12 w-24 h-24 rounded-3xl bg-white/10 animate-float" />
        <div className="absolute bottom-24 right-8 w-32 h-32 rounded-full bg-white/5 animate-float-slow" />
        <div className="absolute top-1/2 -translate-y-1/2 right-16 w-16 h-16 rounded-2xl bg-leaf-400/30 animate-float" style={{ animationDelay: "-2s" }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">AgroVision</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="w-14 h-1 bg-white/30 rounded-full" />
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            Smart farming,<br />powered by AI.
          </h2>
          <p className="text-leaf-200 text-base leading-relaxed max-w-xs">
            Real-time crop monitoring, weather insights, and disease detection — all in one place.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["🌾 Crop Tracking", "🌤️ Weather AI", "🔬 Disease Detect", "🌍 Multi-language"].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-xs backdrop-blur">{f}</span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-leaf-300 text-xs">© 2026 AgroVision</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex justify-between items-center p-5 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <Leaf className="w-5 h-5 text-leaf-500" />
            <span className="font-display font-bold text-lg text-[var(--text)]">AgroVision</span>
          </div>
          <button onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-all relative">
            <Sun  className={`w-4 h-4 absolute transition-all duration-300 ${dark  ? "opacity-0 scale-50" : "opacity-100"}`} />
            <Moon className={`w-4 h-4 absolute transition-all duration-300 ${!dark ? "opacity-0 scale-50" : "opacity-100"}`} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm animate-slide-up space-y-7">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text)]">{title}</h1>
              <p className="mt-2 text-[var(--text2)] text-sm">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.register(form);
      // Pass email to OTP page via router state
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start monitoring your crops with AI today.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name"     placeholder="Your Full Name"      value={form.name}     onChange={set("name")}     required />
        <Input label="Email"         type="email" placeholder="Enter A Valid Email"  value={form.email}    onChange={set("email")}    required />
        <Input label="Password"      type="password" placeholder="Min. 8 chars"  value={form.password} onChange={set("password")} required />
        <Input label="Phone (opt.)"  type="tel" placeholder="+91 xxxxxxxxxxx"     value={form.phone}    onChange={set("phone")}    hint="For SMS crop alerts" />
        <ErrBox msg={error} />
        <Btn type="submit" loading={loading} className="w-full" size="lg">
          Create Account <ArrowRight className="w-4 h-4" />
        </Btn>
      </form>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link to="/login" className="text-leaf-500 hover:text-leaf-600 font-medium transition-colors">Sign in</Link>
      </p>
    </AuthShell>
  );
}

// ── VERIFY OTP ────────────────────────────────────────────────────────────────
export function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp,   setOtp]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp });
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Verify email" subtitle="Enter the 6-digit OTP sent to your inbox.">
      {done ? (
        <div className="text-center space-y-4 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-leaf-100 dark:bg-leaf-900/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-leaf-500" />
          </div>
          <p className="font-medium text-[var(--text)]">Email verified! Redirecting…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="OTP Code" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />
          <ErrBox msg={error} />
          <Btn type="submit" loading={loading} className="w-full" size="lg">
            Verify OTP <ArrowRight className="w-4 h-4" />
          </Btn>
        </form>
      )}
      <p className="text-center text-sm text-[var(--muted)]">
        <Link to="/login" className="text-leaf-500 hover:text-leaf-600 font-medium">← Back to login</Link>
      </p>
    </AuthShell>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.login(form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your AgroVision account.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email"    type="email"    placeholder="Your Email Address" value={form.email}    onChange={set("email")}    required />
        <Input label="Password" type="password" placeholder="Your password"   value={form.password} onChange={set("password")} required />
        <ErrBox msg={error} />
        <Btn type="submit" loading={loading} className="w-full" size="lg">
          Sign In <ArrowRight className="w-4 h-4" />
        </Btn>
      </form>
      <p className="text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link to="/register" className="text-leaf-500 hover:text-leaf-600 font-medium">Create one</Link>
      </p>
    </AuthShell>
  );
}