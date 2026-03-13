// // const BASE = "/api"; 
// const BASE = "https://agrovision-backend-tzqp.onrender.com/api";
 
// async function req(path, options = {}) {
//   const token = localStorage.getItem("av_token");
 
//   const headers = { "Content-Type": "application/json" };
//   if (token) headers["Authorization"] = `Bearer ${token}`;
 
//   if (options.body instanceof FormData) delete headers["Content-Type"];
 
//   const res  = await fetch(BASE + path, { ...options, headers: { ...headers, ...options.headers } });
//   const data = await res.json();
 
//   if (!res.ok) throw new Error(data.message || "Request failed");
//   return data;
// }

// export const authAPI = {
//   register:  (body) => req("/auth/register",   { method: "POST", body: JSON.stringify(body) }),
//   verifyOTP: (body) => req("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
//   login:     (body) => req("/auth/login",      { method: "POST", body: JSON.stringify(body) }),
// };
 
// export const cropAPI = {
//   create:  (body) => req("/crops",         { method: "POST",   body: JSON.stringify(body) }),
//   getAll:  ()     => req("/crops"),
//   getById: (id)   => req(`/crops/${id}`),
//   remove:  (id)   => req(`/crops/${id}`,   { method: "DELETE" }),
// };
 
// export const aiAPI = {
//   getAdvice: (cropId, question = "") =>
//     req("/ai/advice", { method: "POST", body: JSON.stringify({ cropId, question }) }),
 
//   // Disease detection: image file → FormData → multipart POST
//   detectDisease: (cropId, imageFile) => {
//     const form = new FormData();
//     form.append("cropId", cropId);
//     form.append("image",  imageFile); // field name must match multer's uploadSingle("image")
//     return req("/ai/disease-detection", { method: "POST", body: form });
//   },
// };
 
// export const weatherAPI = {
//   byCrop:   (cropId)     => req(`/weather?cropId=${cropId}`),
//   byCoords: (lat, lon)   => req(`/weather?lat=${lat}&lon=${lon}`),
// };


// const BASE = import.meta.env.VITE_API_URL || "/api";
 
// // ── Timeout wrapper ────────────────────────────────────────────────────────
// // Render free tier cold start = 10-12 seconds, so we give 15s
// function fetchWithTimeout(url, options, ms = 15000) {
//   const ctrl = new AbortController();
//   const timer = setTimeout(() => ctrl.abort(), ms);
//   return fetch(url, { ...options, signal: ctrl.signal })
//     .finally(() => clearTimeout(timer));
// }
 
// // ── Core request helper ────────────────────────────────────────────────────
// async function req(path, options = {}) {
//   const token = localStorage.getItem("av_token");
 
//   const headers = { "Content-Type": "application/json" };
//   if (token) headers["Authorization"] = `Bearer ${token}`;
 
//   // FormData: let browser set Content-Type with correct multipart boundary
//   if (options.body instanceof FormData) delete headers["Content-Type"];
 
//   try {
//     const res = await fetchWithTimeout(
//       BASE + path,
//       { ...options, headers: { ...headers, ...options.headers } }
//     );
 
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);
//     return data;
 
//   } catch (err) {
//     if (err.name === "AbortError") {
//       throw new Error("Request timed out. The server may be waking up — please try again in a moment.");
//     }
//     if (!navigator.onLine) {
//       throw new Error("No internet connection. Check your network and try again.");
//     }
//     throw err;
//   }
// }
 
// // ── Auth ──────────────────────────────────────────────────────────────────
// export const authAPI = {
//   register:  (body) => req("/auth/register",   { method: "POST", body: JSON.stringify(body) }),
//   verifyOTP: (body) => req("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
//   login:     (body) => req("/auth/login",      { method: "POST", body: JSON.stringify(body) }),
// };
 
// // ── Crops ─────────────────────────────────────────────────────────────────
// export const cropAPI = {
//   create:  (body) => req("/crops",       { method: "POST",   body: JSON.stringify(body) }),
//   getAll:  ()     => req("/crops"),
//   getById: (id)   => req(`/crops/${id}`),
//   remove:  (id)   => req(`/crops/${id}`, { method: "DELETE" }),
// };
 
// // ── AI ────────────────────────────────────────────────────────────────────
// export const aiAPI = {
//   getAdvice: (cropId, question = "") =>
//     req("/ai/advice", { method: "POST", body: JSON.stringify({ cropId, question }) }),
 
//   detectDisease: (cropId, imageFile) => {
//     const form = new FormData();
//     form.append("cropId", cropId);
//     form.append("image",  imageFile);
//     return req("/ai/disease-detection", { method: "POST", body: form });
//   },
// };
 
// // ── Weather ───────────────────────────────────────────────────────────────
// export const weatherAPI = {
//   byCrop:   (cropId)   => req(`/weather?cropId=${cropId}`),
//   byCoords: (lat, lon) => req(`/weather?lat=${lat}&lon=${lon}`),
// };
 
// // ── Ping — call on app load to wake Render from sleep ─────────────────────
// export const pingBackend = () =>
//   fetch(`${BASE}/ping`).then(r => r.ok).catch(() => false);



// src/services/api.js

// const BASE = import.meta.env.VITE_API_URL || "/api";
const BASE = "https://agrovision-backend-tzqp.onrender.com/api";

// ── Fetch with timeout ─────────────────────────────────────────────────────
function fetchWithTimeout(url, options, ms) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal })
    .finally(() => clearTimeout(timer));
}

// ── Core request — auto-retries once on timeout ────────────────────────────
// Render free tier cold start = 15-30s, so we:
//   1. Try with a 35s timeout
//   2. If that times out, wait 3s then try ONE more time with 35s
async function req(path, options = {}, attempt = 1) {
  const token = localStorage.getItem("av_token");

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body instanceof FormData) delete headers["Content-Type"];

  try {
    const res = await fetchWithTimeout(
      BASE + path,
      { ...options, headers: { ...headers, ...options.headers } },
      35000   // 35 second timeout — covers worst-case Render cold start
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
    return data;

  } catch (err) {
    // Auto-retry ONCE on timeout (Render was still waking up)
    if (err.name === "AbortError" && attempt === 1) {
      await new Promise(r => setTimeout(r, 3000)); // wait 3s
      return req(path, options, 2);                // retry
    }

    if (err.name === "AbortError") {
      throw new Error("Server is taking too long to respond. Please check your internet and try again.");
    }
    if (!navigator.onLine) {
      throw new Error("No internet connection.");
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register:  (body) => req("/auth/register",   { method: "POST", body: JSON.stringify(body) }),
  verifyOTP: (body) => req("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
  login:     (body) => req("/auth/login",      { method: "POST", body: JSON.stringify(body) }),
};

// ── Crops ─────────────────────────────────────────────────────────────────
export const cropAPI = {
  create:  (body) => req("/crops",       { method: "POST",   body: JSON.stringify(body) }),
  getAll:  ()     => req("/crops"),
  getById: (id)   => req(`/crops/${id}`),
  remove:  (id)   => req(`/crops/${id}`, { method: "DELETE" }),
};

// ── AI ────────────────────────────────────────────────────────────────────
export const aiAPI = {
  getAdvice: (cropId, question = "") =>
    req("/ai/advice", { method: "POST", body: JSON.stringify({ cropId, question }) }),

  detectDisease: (cropId, imageFile) => {
    const form = new FormData();
    form.append("cropId", cropId);
    form.append("image",  imageFile);
    return req("/ai/disease-detection", { method: "POST", body: form });
  },
};

// ── Weather ───────────────────────────────────────────────────────────────
export const weatherAPI = {
  byCrop:   (cropId)   => req(`/weather?cropId=${cropId}`),
  byCoords: (lat, lon) => req(`/weather?lat=${lat}&lon=${lon}`),
};

// ── Wake up ping (called silently on app load) ─────────────────────────────
export async function wakeUpBackend(onStatus) {
  // onStatus("waking")  → server not yet awake
  // onStatus("awake")   → server responded
  // onStatus("failed")  → gave up after 45s

  const pingUrl = `${BASE}/ping`;
  const start   = Date.now();
  const GIVE_UP = 45000; // 45 seconds total

  onStatus("waking");

  while (Date.now() - start < GIVE_UP) {
    try {
      const res = await fetchWithTimeout(pingUrl, {}, 10000);
      if (res.ok) { onStatus("awake"); return; }
    } catch {
      // still waking — keep polling
    }
    await new Promise(r => setTimeout(r, 3000)); // poll every 3s
  }

  onStatus("failed");
}