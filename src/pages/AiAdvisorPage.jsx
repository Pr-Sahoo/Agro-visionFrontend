
// src/pages/AIAdvisorPage.jsx

import { useState, useEffect, useRef } from "react";
import {
  Brain, Sprout, Send, Upload, X,
  Microscope, MessageSquare, Link as LinkIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { cropAPI, aiAPI } from "../services/api";
import { Btn, Select, Badge, Spinner, ErrBox } from "../components/ui";

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-4 py-3.5">
      {[0, 150, 300].map(d => (
        <div
          key={d}
          className="w-2 h-2 rounded-full"
          style={{
            background: "var(--green)",
            animation: "bounceDots 1.2s ease-in-out infinite",
            animationDelay: `${d}ms`
          }}
        />
      ))}
    </div>
  );
}

function Bubble({ role, content, idx }) {
  const isAI = role === "assistant";
  return (
    <div
      className={`flex gap-3 animate-slide-up ${isAI ? "" : "flex-row-reverse"}`}
      style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
        style={isAI
          ? { background: "var(--green)", boxShadow: "0 2px 12px rgba(42,154,42,0.35)" }
          : { background: "var(--bg2)", border: "1px solid var(--border)" }
        }
      >
        {isAI
          ? <Brain className="w-4 h-4" style={{ color: "#fff" }} />
          : <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)" }}>U</span>
        }
      </div>

      {/* Bubble */}
      <div
        className="max-w-[78%] px-4 py-3 text-sm leading-relaxed rounded-3xl"
        style={isAI
          ? {
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderTopLeftRadius: "0.375rem",
              color: "var(--text)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap"
            }
          : {
              background: "var(--green)",
              color: "#ffffff",
              borderTopRightRadius: "0.375rem"
            }
        }
      >
        {content}
      </div>
    </div>
  );
}

function UploadZone({ file, onFile, onRemove }) {
  const ref  = useRef();
  const [drag, setDrag] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  if (file) {
    return (
      <div className="relative rounded-2xl overflow-hidden animate-scale-in"
        style={{ border: "2px solid var(--green)" }}>
        <img
          src={URL.createObjectURL(file)}
          alt="crop preview"
          className="w-full object-cover"
          style={{ height: "11rem" }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-white text-xs px-2 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,0.45)" }}>
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </span>
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#ef4444" }}
          >
            <X className="w-3.5 h-3.5" style={{ color: "#fff" }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onClick={() => ref.current?.click()}
      className="rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
      style={{
        border: `2px dashed ${drag ? "var(--green)" : "var(--border)"}`,
        background: drag ? "rgba(42,154,42,0.05)" : "var(--bg2)"
      }}
    >
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--muted)" }} />
      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
        Drop crop photo here or click to browse
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
        JPEG · PNG · WebP · Max 5 MB
      </p>
    </div>
  );
}


function DiseasePanel({ crops }) {
  const [cropId,  setCropId]  = useState("");
  const [file,    setFile]    = useState(null);
  const [result,  setResult]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const detect = async () => {
    if (!cropId) { setError("Please select a crop."); return; }
    if (!file)   { setError("Please upload an image."); return; }
    setError(""); setLoading(true); setResult("");
    try {
      const d = await aiAPI.detectDisease(cropId, file);
      setResult(d.diagnosis || "No diagnosis returned.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Select
        label="Select Crop"
        value={cropId}
        onChange={e => setCropId(e.target.value)}
      >
        <option value="">Choose crop…</option>
        {crops.map(c => (
          <option key={c._id} value={c._id}>{c.cropName}</option>
        ))}
      </Select>

      <UploadZone file={file} onFile={setFile} onRemove={() => setFile(null)} />

      <ErrBox msg={error} />

      <Btn onClick={detect} loading={loading} className="w-full" size="lg">
        <Microscope className="w-5 h-5" />
        {loading ? "Analyzing image…" : "Detect Disease"}
      </Btn>

      {/* Result */}
      {result && (
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--green)" }}>
              <Brain className="w-4 h-4" style={{ color: "#fff" }} />
            </div>
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              Disease Analysis
            </span>
            <Badge variant="green">AI Result</Badge>
          </div>
          <p className="text-sm ai-text">{result}</p>
        </div>
      )}
    </div>
  );
}

// ── AI Chat panel ──────────────────────────────────────────────────────────
function AdvicePanel({ crops }) {
  const [cropId,  setCropId]  = useState("");
  const [q,       setQ]       = useState("");
  const [msgs,    setMsgs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const chatRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  const ask = async () => {
    if (!cropId)    { setError("Select a crop first."); return; }
    if (!q.trim())  return;

    const text = q.trim();
    setQ(""); setError("");
    setMsgs(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const d = await aiAPI.getAdvice(cropId, text);
      setMsgs(prev => [...prev, { role: "assistant", content: d.advice || "No response." }]);
    } catch (err) {
      setError(err.message);
      // Remove the user message if AI failed so chat stays clean
      setMsgs(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
  };

  const CHIPS = [
    "When should I irrigate?",
    "What pests should I watch for?",
    "Is it time to harvest?",
    "What fertilizer should I apply?"
  ];

  return (
    <div className="space-y-4">
      <Select
        label="Crop to ask about"
        value={cropId}
        onChange={e => { setCropId(e.target.value); setMsgs([]); setError(""); }}
      >
        <option value="">Choose crop…</option>
        {crops.map(c => (
          <option key={c._id} value={c._id}>
            {c.cropName}{c.location?.city ? ` — ${c.location.city}` : ""}
          </option>
        ))}
      </Select>

      {/* Chat window */}
      <div
        ref={chatRef}
        className="overflow-y-auto rounded-3xl p-4 space-y-4"
        style={{
          minHeight: "18rem",
          maxHeight: "26rem",
          background: "var(--bg2)"
        }}
      >
        {msgs.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(42,154,42,0.1)" }}>
              <Brain className="w-7 h-7 animate-pulse-soft" style={{ color: "var(--green)" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>AgroVision AI</p>
            <p className="text-xs mb-5 max-w-xs" style={{ color: "var(--muted)" }}>
              Select a crop above then ask anything about irrigation, pests, weather risks, or harvesting.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => setQ(chip)}
                  className="px-3 py-1.5 text-xs rounded-full transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text2)",
                    background: "var(--card)"
                  }}
                  onMouseEnter={e => e.target.style.borderColor = "var(--green)"}
                  onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => <Bubble key={i} {...m} idx={i} />)}

        {loading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--green)" }}>
              <Brain className="w-4 h-4" style={{ color: "#fff" }} />
            </div>
            <div className="card rounded-tl-none"><TypingDots /></div>
          </div>
        )}
      </div>

      {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}

      {/* Input bar */}
      <div className="flex gap-3">
        <textarea
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder={cropId ? "Ask about your crop… (Enter to send)" : "Select a crop first…"}
          rows={2}
          disabled={!cropId}
          className="field flex-1 resize-none"
        />
        <Btn
          onClick={ask}
          loading={loading}
          disabled={!cropId || !q.trim()}
          className="self-end"
          style={{ padding: "0.7rem 1rem" }}
        >
          <Send className="w-5 h-5" />
        </Btn>
      </div>
    </div>
  );
}


export default function AIAdvisorPage() {
  const [tab,     setTab]     = useState("advice");

  const [crops,   setCrops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await cropAPI.getAll();
        // Same safe pattern as DashboardPage and CropsPage
        const safe = Array.isArray(res?.crops) ? res.crops
                   : Array.isArray(res)         ? res
                   : [];
        setCrops(safe);
      } catch (e) {
        console.error("AIAdvisorPage load error:", e);
        setError(e.message);
        setCrops([]); 
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const TABS = [
    { id: "advice",  icon: MessageSquare, label: "AI Chat"            },
    { id: "disease", icon: Microscope,    label: "Disease Detection"  },
  ];

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--green)", boxShadow: "0 4px 18px rgba(42,154,42,0.35)" }}
          >
            <Brain className="w-6 h-6" style={{ color: "#fff" }} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>
              AI Advisor
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text2)" }}>
              Gemini · Contextual farming intelligence
            </p>
          </div>
        </div>

        {/* Error banner */}
        {error && !loading && (
          <div className="card p-4 mb-6 animate-fade-in"
            style={{ borderLeft: "4px solid #ef4444" }}>
            <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
              Failed to load crops: {error}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Make sure your backend is running on port 5000.
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div
          className="flex gap-1.5 p-1 rounded-2xl mb-6 animate-fade-in"
          style={{ background: "var(--bg2)" }}
        >
          {TABS.map(({ id, icon: I, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={tab === id
                ? {
                    background: "var(--card)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }
                : { color: "var(--muted)" }
              }
            >
              <I className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div className="card p-6 animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Spinner size="lg" />
              <p className="text-sm" style={{ color: "var(--muted)" }}>Loading crops…</p>
            </div>
          ) : crops.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <Sprout className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>No crops yet</p>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Add a crop first to use the AI advisor.
              </p>
              <Link
                to="/crops"
                className="btn btn-green inline-flex items-center gap-2"
              >
                <Sprout className="w-4 h-4" /> Add a Crop
              </Link>
            </div>
          ) : tab === "advice" ? (
            <AdvicePanel crops={crops} />
          ) : (
            <DiseasePanel crops={crops} />
          )}
        </div>

      </div>
    </PageLayout>
  );
}