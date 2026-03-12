// src/components/ui/index.jsx

import { useState, forwardRef } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";

export const Btn = forwardRef(function Btn(
  { children, variant = "green", size = "md", loading = false, className = "", ...props },
  ref
) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const vars  = { green: "btn btn-green", outline: "btn btn-outline", ghost: "btn btn-ghost", danger: "btn !bg-red-500 text-white" };
  return (
    <button ref={ref} className={`${vars[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

export const Input = forwardRef(function Input(
  { label, error, hint, type = "text", className = "", ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div className="space-y-1.5">
      {label && <label className="lbl">{label}</label>}
      <div className="relative">
        <input ref={ref} type={isPw ? (show ? "text" : "password") : type}
          className={`field ${error ? "!border-red-400 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""} ${isPw ? "pr-11" : ""} ${className}`}
          {...props} />
        {isPw && (
          <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {hint && !error && <p className="text-[var(--muted)] text-xs mt-1">{hint}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, children, className = "", ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && <label className="lbl">{label}</label>}
      <select ref={ref} className={`field appearance-none cursor-pointer ${error ? "!border-red-400" : ""} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
});

export function Badge({ children, variant = "green" }) {
  const v = { green: "badge badge-green", amber: "badge badge-amber", blue: "badge badge-blue", muted: "badge badge-muted" };
  return <span className={v[variant] || "badge badge-muted"}>{children}</span>;
}

export function Spinner({ size = "md", className = "" }) {
  const s = { sm: "w-4 h-4 border", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-2" };
  return <div className={`${s[size]} rounded-full border-[var(--border)] border-t-[var(--green)] animate-spin ${className}`} />;
}

export function Skel({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div className={`relative w-full ${widths[size]} card p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-[var(--text)]">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const styles = {
    success: "border-l-4 border-green-400 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300",
    error:   "border-l-4 border-red-400 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300",
    info:    "border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl animate-slide-up ${styles[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity ml-2"><X className="w-4 h-4" /></button>
    </div>
  );
}

export function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div className="p-3 rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
      <p className="text-red-600 dark:text-red-400 text-sm">{msg}</p>
    </div>
  );
}