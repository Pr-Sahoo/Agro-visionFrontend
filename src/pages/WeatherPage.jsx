// // src/pages/WeatherPage.jsx

// import { useState, useEffect } from "react";
// import { CloudSun, Droplets, Wind, Thermometer, Eye, RefreshCw, MapPin, Gauge } from "lucide-react";
// import PageLayout from "../components/layout/PageLayout";
// import { cropAPI, weatherAPI } from "../services/api";
// import { Select, Spinner, Skel } from "../components/ui";

// // ── Weather icon by description ────────────────────────────────────────────
// function WIcon({ desc = "", cls = "w-8 h-8" }) {
//   const d = desc.toLowerCase();
//   const emoji = d.includes("thunder") ? "⛈️" : d.includes("rain") ? "🌧️" : d.includes("cloud") ? "☁️" : d.includes("clear") || d.includes("sunny") ? "☀️" : "🌤️";
//   return <span className={`text-3xl ${cls === "w-8 h-8" ? "" : "text-5xl"}`}>{emoji}</span>;
// }

// // ── Forecast card ──────────────────────────────────────────────────────────
// function ForecastCard({ day, i }) {
//   const date = new Date(day.date);
//   const label = i === 0 ? "Today" : i === 1 ? "Tmrw" : date.toLocaleDateString("en-IN", { weekday: "short" });
//   const hasRain = parseFloat(day.totalRain) > 0;
//   return (
//     <div className="card p-4 text-center card-hover animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
//       <p className="text-xs font-semibold text-[var(--muted)] mb-3">{label}</p>
//       <WIcon desc={day.condition} />
//       <p className="text-sm font-bold text-[var(--text)] mt-3">{day.tempMax}°</p>
//       <p className="text-xs text-[var(--muted)]">{day.tempMin}°</p>
//       <p className="text-xs text-[var(--muted)] capitalize mt-1.5 leading-tight text-[10px]">{day.condition}</p>
//       {hasRain && <p className="text-xs text-blue-400 mt-1.5 font-medium">💧 {day.totalRain}mm</p>}
//     </div>
//   );
// }

// // ── Current weather hero ───────────────────────────────────────────────────
// function CurrentHero({ c }) {
//   const desc = c.description?.toLowerCase() || "";
//   const [from, to] = desc.includes("rain") ? ["#3b82f6","#1d4ed8"]
//                    : desc.includes("cloud") ? ["#64748b","#334155"]
//                    : desc.includes("clear") || desc.includes("sunny") ? ["#f59e0b","#d97706"]
//                    : ["#2a9a2a","#1e7a1e"];

//   const stats = [
//     { icon: Droplets,    l: "Humidity",   v: `${c.humidity}%`                   },
//     { icon: Wind,        l: "Wind",       v: `${c.windSpeed} m/s`               },
//     { icon: Thermometer, l: "Feels Like", v: `${Math.round(c.feelsLike)}°C`    },
//     { icon: Gauge,       l: "Pressure",   v: `${c.pressure} hPa`               },
//     { icon: Eye,         l: "Visibility", v: `${(c.visibility/1000).toFixed(1)}km` },
//     { icon: CloudSun,    l: "Rain (1h)",  v: `${c.rain1h ?? 0}mm`              },
//   ];

//   return (
//     <div className="rounded-3xl p-8 text-white relative overflow-hidden animate-slide-up"
//       style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
//       <div className="absolute inset-0 bg-black/10" />
//       <div className="absolute top-6 right-8 text-6xl opacity-20 animate-float">
//         <WIcon desc={c.description} cls="text-6xl" />
//       </div>
//       <div className="relative z-10">
//         <div className="flex items-center gap-2 mb-2 text-white/70">
//           <MapPin className="w-4 h-4" />
//           <span className="font-medium text-sm">{c.city}</span>
//         </div>
//         <div className="flex items-end gap-4 mb-1">
//           <span className="text-8xl font-display font-bold leading-none">{Math.round(c.temp)}°</span>
//           <div className="pb-3">
//             <p className="capitalize text-xl text-white/90">{c.description}</p>
//             <p className="text-white/50 text-sm mt-1">
//               {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
//             </p>
//           </div>
//         </div>
//         <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6 pt-5 border-t border-white/20">
//           {stats.map(({ icon: I, l, v }) => (
//             <div key={l} className="text-center">
//               <I className="w-4 h-4 text-white/60 mx-auto mb-1" />
//               <p className="text-white font-semibold text-sm">{v}</p>
//               <p className="text-white/50 text-xs">{l}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main ───────────────────────────────────────────────────────────────────
// export default function WeatherPage() {
//   const [crops,   setCrops]   = useState([]);
//   const [cropId,  setCropId]  = useState("");
//   const [weather, setWeather] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [cropsLoad, setCropsLoad] = useState(true);
//   const [error,   setError]   = useState("");
//   const [spinning, setSpinning] = useState(false);

//   useEffect(() => {
//     cropAPI.getAll().then(({ crops }) => {
//       setCrops(crops);
//       if (crops.length > 0) setCropId(crops[0]._id);
//     }).finally(() => setCropsLoad(false));
//   }, []);

//   useEffect(() => {
//     if (!cropId) return;
//     setLoading(true); setError("");
//     weatherAPI.byCrop(cropId).then(setWeather).catch(e => setError(e.message)).finally(() => setLoading(false));
//   }, [cropId]);

//   const refresh = async () => {
//     if (!cropId) return;
//     setSpinning(true);
//     try { setWeather(await weatherAPI.byCrop(cropId)); } catch { }
//     finally { setSpinning(false); }
//   };

//   return (
//     <PageLayout>
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="font-display text-3xl font-bold text-[var(--text)]">Weather</h1>
//           <p className="text-[var(--text2)] text-sm mt-1">Real-time conditions for your fields</p>
//         </div>
//         <button onClick={refresh} disabled={spinning || !cropId}
//           className="btn btn-outline flex items-center gap-2 self-start">
//           <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} /> Refresh
//         </button>
//       </div>

//       {!cropsLoad && crops.length > 0 && (
//         <div className="max-w-xs mb-6">
//           <Select label="Field / Crop" value={cropId} onChange={e => setCropId(e.target.value)}>
//             {crops.map(c => <option key={c._id} value={c._id}>{c.cropName} — {c.location?.city || "—"}</option>)}
//           </Select>
//         </div>
//       )}

//       {loading ? (
//         <div className="space-y-5">
//           <Skel className="h-72" />
//           <div className="grid grid-cols-5 gap-3">{Array(5).fill(0).map((_, i) => <Skel key={i} className="h-36" />)}</div>
//         </div>
//       ) : error ? (
//         <div className="card p-10 text-center">
//           <p className="text-red-500 mb-2">{error}</p>
//           <p className="text-[var(--muted)] text-sm">Check your OpenWeather API key and crop location.</p>
//         </div>
//       ) : !weather ? (
//         <div className="card p-16 text-center animate-fade-in">
//           <span className="text-6xl mb-4 block animate-float">🌤️</span>
//           <p className="font-medium text-[var(--text)]">No weather data</p>
//           <p className="text-[var(--muted)] text-sm mt-2">Add a crop with a location to view weather.</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           <CurrentHero c={weather.current} />

//           <div>
//             <h2 className="font-display font-semibold text-xl text-[var(--text)] mb-4">5-Day Forecast</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//               {weather.forecast?.map((d, i) => <ForecastCard key={d.date} day={d} i={i} />)}
//             </div>
//           </div>

//           {/* Smart alerts based on data */}
//           {weather.forecast?.some(d => parseFloat(d.totalRain) > 5) && (
//             <div className="card p-5" style={{ borderLeft: "4px solid #3b82f6" }}>
//               <p className="font-medium text-[var(--text)]">🌧️ Rain Alert</p>
//               <p className="text-sm text-[var(--text2)] mt-1">
//                 Heavy rain expected. Consider pausing irrigation and checking field drainage.
//               </p>
//             </div>
//           )}
//           {weather.current.temp > 38 && (
//             <div className="card p-5" style={{ borderLeft: "4px solid #f59e0b" }}>
//               <p className="font-medium text-[var(--text)]">🌡️ Heat Alert</p>
//               <p className="text-sm text-[var(--text2)] mt-1">
//                 Temperature above 38°C. Increase irrigation frequency and avoid midday fieldwork.
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </PageLayout>
//   );
// }




// src/pages/WeatherPage.jsx

import { useState, useEffect } from "react";
import {
  CloudSun, Droplets, Wind, Thermometer,
  Eye, RefreshCw, MapPin, Gauge
} from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { cropAPI, weatherAPI } from "../services/api";
import { Select, Spinner, Skel } from "../components/ui";

// ── Weather emoji by description ───────────────────────────────────────────
function weatherEmoji(desc = "") {
  const d = desc.toLowerCase();
  if (d.includes("thunder")) return "⛈️";
  if (d.includes("rain"))    return "🌧️";
  if (d.includes("snow"))    return "❄️";
  if (d.includes("cloud"))   return "☁️";
  if (d.includes("clear") || d.includes("sunny")) return "☀️";
  return "🌤️";
}

// ── Gradient by description ────────────────────────────────────────────────
function weatherGradient(desc = "") {
  const d = desc.toLowerCase();
  if (d.includes("thunder")) return ["#7c3aed", "#4c1d95"];
  if (d.includes("rain"))    return ["#3b82f6", "#1d4ed8"];
  if (d.includes("cloud"))   return ["#64748b", "#334155"];
  if (d.includes("clear") || d.includes("sunny")) return ["#f59e0b", "#d97706"];
  return ["#2a9a2a", "#1e7a1e"];
}

// ── Current weather hero ───────────────────────────────────────────────────
function CurrentHero({ current }) {
  // Guard: if current is missing or malformed, show placeholder
  if (!current || typeof current !== "object") {
    return (
      <div className="card p-10 text-center animate-fade-in">
        <p style={{ color: "var(--muted)" }}>Weather data unavailable.</p>
      </div>
    );
  }

  const [from, to] = weatherGradient(current.description || "");

  const stats = [
    { icon: Droplets,    label: "Humidity",   val: `${current.humidity ?? "—"}%`               },
    { icon: Wind,        label: "Wind",        val: `${current.windSpeed ?? "—"} m/s`           },
    { icon: Thermometer, label: "Feels Like",  val: `${Math.round(current.feelsLike ?? 0)}°C`  },
    { icon: Gauge,       label: "Pressure",    val: `${current.pressure ?? "—"} hPa`           },
    { icon: Eye,         label: "Visibility",  val: current.visibility
        ? `${(current.visibility / 1000).toFixed(1)} km`
        : "—"
    },
    { icon: CloudSun,    label: "Rain 1h",     val: `${current.rain1h ?? 0} mm`                },
  ];

  return (
    <div
      className="rounded-3xl p-8 text-white relative overflow-hidden animate-slide-up"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.08)" }} />

      {/* Floating emoji background */}
      <div
        className="absolute top-6 right-8 text-7xl pointer-events-none animate-float"
        style={{ opacity: 0.2 }}
      >
        {weatherEmoji(current.description)}
      </div>

      <div className="relative z-10">
        {/* Location */}
        <div className="flex items-center gap-2 mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
          <MapPin className="w-4 h-4" />
          <span className="font-medium text-sm">{current.city || "Your field"}</span>
        </div>

        {/* Temperature + description */}
        <div className="flex items-end gap-5 mb-1">
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: "5.5rem", color: "#fff" }}
          >
            {Math.round(current.temp ?? 0)}°
          </span>
          <div className="pb-4">
            <p className="text-xl capitalize" style={{ color: "rgba(255,255,255,0.9)" }}>
              {current.description || "—"}
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", month: "long", day: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid gap-3 mt-6 pt-5"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1px solid rgba(255,255,255,0.2)"
          }}
        >
          {stats.slice(0, 3).map(({ icon: I, label, val }) => (
            <div key={label} className="text-center">
              <I className="w-4 h-4 mx-auto mb-1" style={{ color: "rgba(255,255,255,0.6)" }} />
              <p className="font-semibold text-sm" style={{ color: "#fff" }}>{val}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Second row — only on sm+ */}
        <div
          className="grid gap-3 mt-3 hidden sm:grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)"
          }}
        >
          {stats.slice(3).map(({ icon: I, label, val }) => (
            <div key={label} className="text-center">
              <I className="w-4 h-4 mx-auto mb-1" style={{ color: "rgba(255,255,255,0.6)" }} />
              <p className="font-semibold text-sm" style={{ color: "#fff" }}>{val}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Forecast day card ──────────────────────────────────────────────────────
function ForecastCard({ day, index }) {
  if (!day) return null;

  const label = index === 0 ? "Today"
              : index === 1 ? "Tomorrow"
              : new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" });

  const hasRain = parseFloat(day.totalRain || 0) > 0;

  return (
    <div
      className="card card-hover p-4 text-center animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>{label}</p>

      <span className="text-3xl">{weatherEmoji(day.condition || "")}</span>

      <p className="font-bold text-sm mt-3" style={{ color: "var(--text)" }}>
        {day.tempMax ?? "—"}°
      </p>
      <p className="text-xs" style={{ color: "var(--muted)" }}>{day.tempMin ?? "—"}°</p>

      <p
        className="text-xs capitalize mt-2 leading-tight"
        style={{ color: "var(--muted)", fontSize: "0.65rem" }}
      >
        {day.condition || "—"}
      </p>

      {hasRain && (
        <p className="text-xs font-medium mt-1.5" style={{ color: "#3b82f6" }}>
          💧 {day.totalRain}mm
        </p>
      )}
    </div>
  );
}

// ── Alert banner ───────────────────────────────────────────────────────────
function Alert({ emoji, title, message, color }) {
  return (
    <div
      className="card p-5 animate-slide-up"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>
        {emoji} {title}
      </p>
      <p className="text-sm" style={{ color: "var(--text2)" }}>{message}</p>
    </div>
  );
}

// ── Main WeatherPage ───────────────────────────────────────────────────────
export default function WeatherPage() {
  // ── Always safe initial values ────────────────────────────────────────────
  const [crops,     setCrops]     = useState([]);
  const [cropId,    setCropId]    = useState("");
  const [weather,   setWeather]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [cropsLoad, setCropsLoad] = useState(true);
  const [error,     setError]     = useState("");
  const [refreshing,setRefreshing]= useState(false);

  // Step 1: Load crops list
  useEffect(() => {
    (async () => {
      try {
        const res = await cropAPI.getAll();
        // Safe destructure — same pattern used everywhere
        const safe = Array.isArray(res?.crops) ? res.crops
                   : Array.isArray(res)         ? res
                   : [];
        setCrops(safe);
        if (safe.length > 0) setCropId(safe[0]._id);
      } catch (e) {
        console.error("WeatherPage crops load:", e);
        setCrops([]);
      } finally {
        setCropsLoad(false);
      }
    })();
  }, []);

  // Step 2: Load weather when cropId is available
  useEffect(() => {
    if (!cropId) return;
    setLoading(true);
    setError("");
    setWeather(null);

    weatherAPI.byCrop(cropId)
      .then(data => setWeather(data ?? null))
      .catch(e => {
        console.error("Weather fetch error:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [cropId]);

  const refresh = async () => {
    if (!cropId) return;
    setRefreshing(true);
    try {
      const data = await weatherAPI.byCrop(cropId);
      setWeather(data ?? null);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Safe access to forecast — always fallback to []
  const forecast = Array.isArray(weather?.forecast) ? weather.forecast : [];

  // Smart alerts based on data
  const hasHeavyRain = forecast.some(d => parseFloat(d?.totalRain || 0) > 5);
  const isHeatwave   = weather?.current?.temp > 38;

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>
            Weather
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text2)" }}>
            Real-time conditions for your fields
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing || !cropId || loading}
          className="btn btn-outline flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Crop selector */}
      {!cropsLoad && crops.length > 0 && (
        <div className="max-w-xs mb-6 animate-fade-in">
          <Select
            label="Select field / crop"
            value={cropId}
            onChange={e => setCropId(e.target.value)}
          >
            {crops.map(c => (
              <option key={c._id} value={c._id}>
                {c.cropName}{c.location?.city ? ` — ${c.location.city}` : ""}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* No crops state */}
      {!cropsLoad && crops.length === 0 && (
        <div className="card p-16 text-center animate-fade-in">
          <span className="text-6xl block mb-4 animate-float">🌤️</span>
          <p className="font-semibold" style={{ color: "var(--text)" }}>No crops added yet</p>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            Add a crop with a location to view weather data.
          </p>
        </div>
      )}

      {/* Loading */}
      {(loading || cropsLoad) && crops.length > 0 && (
        <div className="space-y-5 animate-fade-in">
          <Skel className="h-72" />
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {Array(5).fill(0).map((_, i) => <Skel key={i} className="h-36" />)}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="card p-8 text-center animate-fade-in"
          style={{ borderLeft: "4px solid #ef4444" }}>
          <p className="font-medium mb-1" style={{ color: "#ef4444" }}>{error}</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Check your OpenWeather API key and crop location coordinates.
          </p>
        </div>
      )}

      {/* Weather data */}
      {!loading && !cropsLoad && !error && weather && (
        <div className="space-y-6">
          {/* Current conditions */}
          <CurrentHero current={weather.current} />

          {/* 5-day forecast */}
          {forecast.length > 0 && (
            <div>
              <h2
                className="font-display font-semibold text-xl mb-4"
                style={{ color: "var(--text)" }}
              >
                5-Day Forecast
              </h2>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
              >
                {forecast.map((day, i) => (
                  <ForecastCard key={day?.date || i} day={day} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Smart alerts */}
          {hasHeavyRain && (
            <Alert
              emoji="🌧️"
              title="Rain Alert"
              message="Heavy rain expected in the coming days. Consider pausing irrigation and checking field drainage."
              color="#3b82f6"
            />
          )}
          {isHeatwave && (
            <Alert
              emoji="🌡️"
              title="Heat Alert"
              message="Temperature above 38°C. Increase irrigation frequency and avoid midday fieldwork."
              color="#f59e0b"
            />
          )}
        </div>
      )}
    </PageLayout>
  );
}