
// src/App.jsx

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider }         from "./context/ThemeContext";
import { wakeUpBackend }         from "./services/api";

import { RegisterPage, VerifyOTPPage, LoginPage } from "./pages/AuthPages";
import DashboardPage  from "./pages/DashboardPage";
import CropsPage      from "./pages/CropsPage";
import AIAdvisorPage  from "./pages/AIAdvisorPage";
import WeatherPage    from "./pages/WeatherPage";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader text="Loading…" />;
  return user ? children : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function FullScreenLoader({ text }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--bg)" }}>
      <div className="w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-[var(--green)] animate-spin mb-4" />
      <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>{text}</p>
    </div>
  );
}


function WakeUpScreen({ onAwake }) {
  const [dots,    setDots]    = useState(".");
  const [elapsed, setElapsed] = useState(0);
  const [failed,  setFailed]  = useState(false);

  // Animate the dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(t);
  }, []);

  // Count seconds
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const messages = [
    { at: 0,  text: "Connecting to server…"                    },
    { at: 5,  text: "Server is waking up from sleep…"          },
    { at: 12, text: "Almost there, still starting…"            },
    { at: 22, text: "This is a free server, bear with us…"     },
    { at: 35, text: "Taking longer than usual, still trying…"  },
  ];

  const currentMsg = [...messages]
    .reverse()
    .find(m => elapsed >= m.at)?.text || "Connecting…";

  const pct = Math.min((elapsed / 40) * 100, 95);

  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--bg)" }}>
        <div className="card p-10 max-w-sm w-full text-center animate-scale-in">
          <div className="text-4xl mb-4">😴</div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Server didn't respond
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            The backend server on Render may be having issues. Try refreshing, or check again in a minute.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-green w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-xs text-center animate-fade-in">

        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl"
          style={{ background: "var(--green)", boxShadow: "0 8px 32px rgba(42,154,42,0.35)" }}>
          🌿
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
          AgroVision
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
          AI-powered crop monitoring
        </p>

        {/* Progress bar */}
        <div className="w-full rounded-full mb-3 overflow-hidden"
          style={{ height: "6px", background: "var(--bg2)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: "var(--green)" }}
          />
        </div>

        {/* Status message */}
        <p className="text-sm font-medium" style={{ color: "var(--text2)" }}>
          {currentMsg}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          {elapsed}s elapsed
        </p>

        {/* Explanation after 8s */}
        {elapsed >= 8 && (
          <div
            className="mt-8 p-4 rounded-2xl text-left animate-fade-in"
            style={{ background: "var(--bg2)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text)" }}>
              Why is this slow?
            </p>
            <p className="text-xs" style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              AgroVision runs on a <strong style={{ color: "var(--text2)" }}>free Render server</strong> that
              goes to sleep after 15 minutes of inactivity.
              The first request of the day wakes it up — this takes 15–30 seconds.
              After that, everything will be fast.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/register"   element={<Public><RegisterPage  /></Public>} />
      <Route path="/verify-otp" element={<Public><VerifyOTPPage /></Public>} />
      <Route path="/login"      element={<Public><LoginPage     /></Public>} />
      <Route path="/dashboard"  element={<Protected><DashboardPage  /></Protected>} />
      <Route path="/crops"      element={<Protected><CropsPage      /></Protected>} />
      <Route path="/weather"    element={<Protected><WeatherPage    /></Protected>} />
      <Route path="/ai-advisor" element={<Protected><AIAdvisorPage  /></Protected>} />
      <Route path="/"           element={<Navigate to="/dashboard" replace />} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  // "checking" | "waking" | "awake" | "failed"
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => {
    // Start pinging the backend immediately when app loads.
    // wakeUpBackend polls /api/ping every 3s for up to 45s.
    wakeUpBackend((status) => {
      setServerStatus(status);
    });
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {serverStatus === "awake" ? (
            <AppRoutes />
          ) : (
            <WakeUpScreen onAwake={() => setServerStatus("awake")} />
          )}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}