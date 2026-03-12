

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sprout, Plus, Trash2, ArrowRight, MapPin, Calendar, Search } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { cropAPI } from "../services/api";
import { Btn, Input, Select, Badge, Modal, Toast, Skel, Spinner, ErrBox } from "../components/ui";

// ── Add crop form ──────────────────────────────────────────────────────────
function CropForm({ onSuccess, onClose }) {
  const [f, setF] = useState({
    cropName: "", cropType: "", variety: "",
    area: "", areaUnit: "acres", soilType: "",
    plantingDate: "", harvestTarget: "",
    lat: "", lon: "", city: "",
    notifyEmail: true, notifySMS: false
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [locLoad, setLocLoad] = useState(false);

  const s = (k) => (e) =>
    setF(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const detectLoc = () => {
    if (!navigator.geolocation) return;
    setLocLoad(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setF(p => ({
          ...p,
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6)
        }));
        setLocLoad(false);
      },
      () => setLocLoad(false)
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.lat || !f.lon) { setError("Location is required."); return; }
    setError("");
    setLoading(true);
    try {
      await cropAPI.create({
        cropName:      f.cropName,
        cropType:      f.cropType,
        variety:       f.variety,
        area:          parseFloat(f.area) || undefined,
        areaUnit:      f.areaUnit,
        soilType:      f.soilType,
        plantingDate:  f.plantingDate  || undefined,
        harvestTarget: f.harvestTarget || undefined,
        location:      { lat: parseFloat(f.lat), lon: parseFloat(f.lon), city: f.city },
        notifyEmail:   f.notifyEmail,
        notifySMS:     f.notifySMS,
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Crop Name *" placeholder="Wheat, Rice…"
          value={f.cropName} onChange={s("cropName")} required />
        <Select label="Crop Type" value={f.cropType} onChange={s("cropType")}>
          <option value="">Select…</option>
          {["Cereal","Vegetable","Fruit","Legume","Oilseed","Spice","Fiber"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Variety" placeholder="Basmati, Hybrid…"
          value={f.variety} onChange={s("variety")} />
        <Select label="Soil Type" value={f.soilType} onChange={s("soilType")}>
          <option value="">Select…</option>
          {["Sandy","Loamy","Clay","Silt","Peaty","Black Cotton"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Input label="Area" type="number" step="0.1" placeholder="2.5"
            value={f.area} onChange={s("area")} />
        </div>
        <Select label="Unit" value={f.areaUnit} onChange={s("areaUnit")}>
          <option value="acres">Acres</option>
          <option value="hectares">Hectares</option>
          <option value="sqft">Sq.Ft</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Planting Date" type="date"
          value={f.plantingDate} onChange={s("plantingDate")} />
        <Input label="Harvest Target" type="date"
          value={f.harvestTarget} onChange={s("harvestTarget")} />
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="lbl mb-0">Location *</span>
          <button type="button" onClick={detectLoc}
            className="text-xs text-leaf-500 hover:text-leaf-600 font-medium flex items-center gap-1 transition-colors">
            {locLoad ? <Spinner size="sm" /> : <MapPin className="w-3 h-3" />}
            Auto-detect
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input placeholder="Latitude"  value={f.lat}  onChange={s("lat")}  />
          <Input placeholder="Longitude" value={f.lon}  onChange={s("lon")}  />
          <Input placeholder="City name" value={f.city} onChange={s("city")} />
        </div>
      </div>

      {/* Notifications */}
      <div className="flex gap-6 p-4 rounded-2xl" style={{ background: "var(--bg2)" }}>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text)]">
          <input type="checkbox" checked={f.notifyEmail} onChange={s("notifyEmail")}
            className="w-4 h-4 accent-leaf-500" />
          Email alerts
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text)]">
          <input type="checkbox" checked={f.notifySMS} onChange={s("notifySMS")}
            className="w-4 h-4 accent-leaf-500" />
          SMS alerts
        </label>
      </div>

      <ErrBox msg={error} />

      <div className="flex gap-3 pt-1">
        <Btn type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Btn>
        <Btn type="submit" className="flex-1" loading={loading}>
          <Sprout className="w-4 h-4" /> Add Crop
        </Btn>
      </div>
    </form>
  );
}

// ── Crop card ──────────────────────────────────────────────────────────────
function CropCard({ crop, onDelete, i }) {
  const [del, setDel] = useState(false);

  const days = crop.harvestTarget
    ? Math.ceil((new Date(crop.harvestTarget) - Date.now()) / 86400000)
    : null;

  const remove = async (e) => {
    e.preventDefault();
    if (!confirm(`Remove "${crop.cropName}"?`)) return;
    setDel(true);
    try {
      await cropAPI.remove(crop._id);
      onDelete(crop._id);
    } catch {
      setDel(false);
    }
  };

  return (
    <div className="card card-hover group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#3fb83f,#1e7a1e)", boxShadow: "0 4px 18px rgba(42,154,42,0.3)" }}>
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] group-hover:text-leaf-600 dark:group-hover:text-leaf-400 transition-colors">
                {crop.cropName}
              </h3>
              {crop.variety && (
                <p className="text-xs text-[var(--muted)]">{crop.variety}</p>
              )}
            </div>
          </div>
          <button onClick={remove} disabled={del}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-500">
            {del ? <Spinner size="sm" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {[
            { label: "Soil",     val: crop.soilType || "—" },
            { label: "Area",     val: crop.area ? `${crop.area} ${crop.areaUnit}` : "—" },
            { label: "Location", val: crop.location?.city || "—" },
            { label: "Harvest",  val: crop.harvestTarget
                ? new Date(crop.harvestTarget).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "—" },
          ].map(({ label, val }) => (
            <div key={label}>
              <span className="text-[var(--muted)]">{label}: </span>
              <span className="font-medium text-[var(--text)]">{val}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {crop.cropType && <Badge variant="green">{crop.cropType}</Badge>}
            {days !== null && (
              <Badge variant={days < 0 ? "muted" : days < 14 ? "amber" : "green"}>
                {days < 0 ? "Past due" : `${days}d to harvest`}
              </Badge>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

// ── Main CropsPage ─────────────────────────────────────────────────────────
export default function CropsPage() {
  // ── ALWAYS initialise as [] — never undefined ────────────────────────────
  const [crops,   setCrops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [toast,   setToast]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [error,   setError]   = useState("");

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cropAPI.getAll();

      // ── SAFE DESTRUCTURE (same pattern as DashboardPage) ─────────────────
      // Backend returns { crops: [...] }
      // Guard against null / undefined / wrong shape
      const safeCrops = Array.isArray(res?.crops) ? res.crops
                      : Array.isArray(res)         ? res
                      : [];
      // ────────────────────────────────────────────────────────────────────

      setCrops(safeCrops);
    } catch (e) {
      console.error("Load crops error:", e);
      setError(e.message);
      setCrops([]); // keep state as valid array even on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── SAFE filter — crops is always [] so .filter() never crashes ──────────
  const filtered = crops.filter(c =>
    (c.cropName  || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.cropType  || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)]">My Crops</h1>
          <p className="text-[var(--text2)] text-sm mt-1">
            {loading ? "Loading…" : `${crops.length} crop${crops.length !== 1 ? "s" : ""} being monitored`}
          </p>
        </div>
        <Btn onClick={() => setModal(true)} className="self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Crop
        </Btn>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="card p-4 mb-6 animate-fade-in" style={{ borderLeft: "4px solid #ef4444" }}>
          <p className="text-red-500 text-sm font-medium">Error: {error}</p>
          <p className="text-[var(--muted)] text-xs mt-1">Make sure your backend is running on port 5000.</p>
        </div>
      )}

      {/* Search bar */}
      {!loading && crops.length > 0 && (
        <div className="relative mb-6 max-w-xs animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            className="field pl-10"
            placeholder="Search crops…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <Skel key={i} className="h-56" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <Sprout className="w-16 h-16 text-[var(--muted)] mx-auto mb-5" />
          <h2 className="font-display text-2xl font-semibold text-[var(--text)] mb-2">
            {search ? "No crops found" : "No crops yet"}
          </h2>
          <p className="text-[var(--muted)] text-sm mb-8 max-w-xs mx-auto">
            {search
              ? `No results for "${search}"`
              : "Add your first crop to start AI-powered monitoring."}
          </p>
          {!search && (
            <Btn onClick={() => setModal(true)} size="lg">
              <Plus className="w-4 h-4" /> Add First Crop
            </Btn>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => (
            <CropCard
              key={c._id}
              crop={c}
              i={i}
              onDelete={(id) => {
                setCrops(prev => prev.filter(x => x._id !== id));
                flash("Crop removed.", "info");
              }}
            />
          ))}
        </div>
      )}

      {/* Add Crop Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Crop" size="lg">
        <CropForm
          onSuccess={() => { setModal(false); flash("Crop added!"); load(); }}
          onClose={() => setModal(false)}
        />
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </PageLayout>
  );
}