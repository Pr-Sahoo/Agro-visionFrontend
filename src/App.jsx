import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }  from "./context/AuthContext";
import { ThemeProvider }          from "./context/ThemeContext";
import { Spinner }                from "./components/ui";
 
import { RegisterPage, VerifyOTPPage, LoginPage } from "./pages/AuthPages";
import DashboardPage  from "./pages/DashboardPage";
import CropsPage      from "./pages/CropsPage";
import AIAdvisorPage  from "./pages/AIAdvisorPage";
import WeatherPage    from "./pages/WeatherPage";
 
// ── Protected route wrapper ────────────────────────────────────────────────
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg)" }}>
        <Spinner size="lg" />
        <p className="text-[var(--muted)] text-sm mt-4 font-medium">Loading AgroVision…</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}
 
// ── Public route wrapper (redirect if already logged in) ───────────────────
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}
 
// ── Routes ─────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/register"   element={<Public><RegisterPage  /></Public>} />
      <Route path="/verify-otp" element={<Public><VerifyOTPPage /></Public>} />
      <Route path="/login"      element={<Public><LoginPage     /></Public>} />
 
      {/* Protected */}
      <Route path="/dashboard"  element={<Protected><DashboardPage  /></Protected>} />
      <Route path="/crops"      element={<Protected><CropsPage      /></Protected>} />
      <Route path="/weather"    element={<Protected><WeatherPage    /></Protected>} />
      <Route path="/ai-advisor" element={<Protected><AIAdvisorPage  /></Protected>} />
 
      {/* Default */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
 
export default function App() {
  return (
    <BrowserRouter>
      {/* ThemeProvider — controls dark/light class on <html> */}
      <ThemeProvider>
        {/* AuthProvider — controls global user session */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
 