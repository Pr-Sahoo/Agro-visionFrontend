// src/pages/DashboardPage.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sprout, CloudSun, Brain, Plus, ArrowRight, Thermometer, Droplets, Wind, Activity } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { cropAPI, weatherAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Badge, Skel } from "../components/ui";

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = "#2a9a2a", delay = 0 }) {
  return (
    <div className="card p-6 card-hover animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${accent}18`, color: accent }}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-display font-bold text-[var(--text)]">{value}</p>
      <p className="text-sm font-medium text-[var(--text)] mt-1">{label}</p>
      {sub && <p className="text-xs text-[var(--muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Mini crop row ──────────────────────────────────────────────────────────
function CropRow({ crop, i }) {
  const days = crop.harvestTarget
    ? Math.ceil((new Date(crop.harvestTarget) - Date.now()) / 86400000)
    : null;

  return (
    <Link to="/crops"
      className="card p-4 flex items-center justify-between card-hover group animate-fade-in"
      style={{ animationDelay: `${i * 50}ms` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-leaf-500/10 flex items-center justify-center">
          <Sprout className="w-5 h-5 text-leaf-600 dark:text-leaf-400" />
        </div>
        <div>
          <p className="font-semibold text-sm text-[var(--text)] group-hover:text-leaf-600 dark:group-hover:text-leaf-400 transition-colors">
            {crop.cropName}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {crop.location?.city || "Location set"} · {crop.soilType || "—"} soil
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {days !== null && (
          <Badge variant={days < 14 ? "amber" : "green"}>{days}d</Badge>
        )}
        <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

// ── Weather mini widget ────────────────────────────────────────────────────
function WeatherMini({ w }) {
  if (!w || !w.current) return (
    <div className="card p-6 text-center animate-fade-in">
      <CloudSun className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
      <p className="text-sm text-[var(--muted)]">No weather data yet</p>
      <p className="text-xs text-[var(--muted)] mt-1">Add a crop with a location to see weather</p>
    </div>
  );

  const c = w.current;
  const desc = (c.description || "").toLowerCase();
  const from = desc.includes("rain")  ? "#3b82f6"
             : desc.includes("cloud") ? "#64748b"
             : desc.includes("clear") || desc.includes("sunny") ? "#f59e0b"
             : "#2a9a2a";

  return (
    <div className="rounded-3xl p-6 text-white relative overflow-hidden animate-slide-up"
      style={{ background: `linear-gradient(135deg, ${from}, ${from}cc)` }}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10">
        <p className="text-white/70 text-sm">{c.city || "Your field"}</p>
        <p className="text-5xl font-display font-bold mt-1">{Math.round(c.temp ?? 0)}°C</p>
        <p className="text-white/80 capitalize mt-1 text-sm">{c.description || "—"}</p>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20 text-center">
          {[
            { icon: Droplets,    v: `${c.humidity ?? "—"}%`,             l: "Humidity" },
            { icon: Wind,        v: `${c.windSpeed ?? "—"} m/s`,         l: "Wind"     },
            { icon: Thermometer, v: `${Math.round(c.feelsLike ?? 0)}°`, l: "Feels"    },
          ].map(({ icon: I, v, l }) => (
            <div key={l}>
              <I className="w-4 h-4 text-white/60 mx-auto mb-1" />
              <p className="text-white text-sm font-semibold">{v}</p>
              <p className="text-white/50 text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }  = useAuth();
  const [crops,   setCrops]   = useState([]);   // ALWAYS [] — never undefined
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await cropAPI.getAll();

        // ── SAFE DESTRUCTURE ─────────────────────────────────────────────
        // Your backend returns: { crops: [...] }
        // But we guard against: null, undefined, wrong shape
        const safeCrops = Array.isArray(res?.crops) ? res.crops
                        : Array.isArray(res)         ? res
                        : [];
        // ────────────────────────────────────────────────────────────────

        setCrops(safeCrops);

        // Fetch weather only if crops exist with valid IDs
        if (safeCrops.length > 0 && safeCrops[0]._id) {
          try {
            const w = await weatherAPI.byCrop(safeCrops[0]._id);
            setWeather(w ?? null);
          } catch (we) {
            // Weather error should NOT crash the dashboard
            console.warn("Weather fetch failed:", we.message);
          }
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  // Safe reduce — guards against non-array aiHistory
  const totalAdvice = crops.reduce((acc, c) => {
    const hist = Array.isArray(c.aiHistory) ? c.aiHistory : [];
    return acc + Math.floor(hist.length / 2);
  }, 0);

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold mb-1">
            {greeting()}
          </p>
          <h1 className="font-display text-4xl font-bold text-[var(--text)]">
            {user?.name?.split(" ")[0] || "Farmer"} 👋
          </h1>
          <p className="text-[var(--text2)] mt-2 text-sm">
            {loading
              ? "Loading your farm data…"
              : crops.length > 0
                ? `Monitoring ${crops.length} crop${crops.length !== 1 ? "s" : ""} across your fields.`
                : "Add your first crop to get started."}
          </p>
        </div>
        <Link to="/crops" className="btn btn-green hidden sm:flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Crop
        </Link>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="card p-4 mb-6 animate-fade-in" style={{ borderLeft: "4px solid #ef4444" }}>
          <p className="text-red-500 text-sm font-medium">Failed to load: {error}</p>
          <p className="text-[var(--muted)] text-xs mt-1">Make sure your backend is running on port 5000.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skel key={i} className="h-36" />)
        ) : (
          <>
            <StatCard icon={Sprout}   label="Active Crops"  value={crops.length}  accent="#2a9a2a" delay={0}   />
            <StatCard icon={Activity} label="AI Advisories" value={totalAdvice}    accent="#b86e1f" delay={60}  sub="Total exchanges" />
            <StatCard icon={Brain}    label="Disease Scans" value="—"             accent="#1294e0" delay={120} sub="Upload a photo" />
            <StatCard icon={CloudSun} label="Weather"       value={weather ? "Live" : "—"} accent="#7c3aed" delay={180} />
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Crops list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl text-[var(--text)]">My Crops</h2>
            <Link to="/crops"
              className="text-sm text-leaf-500 hover:text-leaf-600 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            Array(3).fill(0).map((_, i) => <Skel key={i} className="h-20" />)
          ) : crops.length === 0 ? (
            <div className="card p-12 text-center animate-fade-in">
              <Sprout className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
              <p className="font-medium text-[var(--text)] mb-2">No crops yet</p>
              <p className="text-[var(--muted)] text-sm mb-6">
                Add your first crop to start getting AI advice.
              </p>
              <Link to="/crops" className="btn btn-green inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add First Crop
              </Link>
            </div>
          ) : (
            crops.slice(0, 5).map((c, i) => <CropRow key={c._id} crop={c} i={i} />)
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-xl text-[var(--text)]">Weather</h2>
          {loading ? <Skel className="h-52" /> : <WeatherMini w={weather} />}

          <h2 className="font-display font-semibold text-xl text-[var(--text)] mt-6">Quick Actions</h2>
          {[
            { to: "/ai-advisor", icon: Brain,    label: "Get AI Advice", color: "text-leaf-500" },
            { to: "/crops",      icon: Plus,     label: "Add New Crop",  color: "text-soil-500" },
            { to: "/weather",    icon: CloudSun, label: "Full Weather",  color: "text-sky-500"  },
          ].map(({ to, icon: I, label, color }) => (
            <Link key={to} to={to}
              className="card card-hover flex items-center gap-4 p-4 group animate-fade-in">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--bg2)" }}>
                <I className={`w-5 h-5 ${color}`} />
              </div>
              <span className="flex-1 font-medium text-sm text-[var(--text)] group-hover:text-leaf-600 dark:group-hover:text-leaf-400 transition-colors">
                {label}
              </span>
              <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>

      </div>
    </PageLayout>
  );
}