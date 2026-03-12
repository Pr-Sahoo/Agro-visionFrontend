/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from "react";
 
const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until we check localStorage
 
  // On first render, restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("av_token");
    const storedUser  = localStorage.getItem("av_user");
    if (storedToken && storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* bad JSON — ignore */ }
    }
    setLoading(false);
  }, []);
 
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("av_token", token);
    localStorage.setItem("av_user",  JSON.stringify(userData));
  };
 
  const logout = () => {
    setUser(null);
    localStorage.removeItem("av_token");
    localStorage.removeItem("av_user");
  };
 
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
 
// Custom hook — components use this instead of useContext directly
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}