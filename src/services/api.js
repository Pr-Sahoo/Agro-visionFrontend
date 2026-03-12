const BASE = "/api"; 
 
// ── Core helper ───────────────────────────────────────────────────────────────
async function req(path, options = {}) {
  const token = localStorage.getItem("av_token");
 
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
 
  // FormData: let browser set Content-Type (includes boundary)
  if (options.body instanceof FormData) delete headers["Content-Type"];
 
  const res  = await fetch(BASE + path, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
 
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
 
// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:  (body) => req("/auth/register",   { method: "POST", body: JSON.stringify(body) }),
  verifyOTP: (body) => req("/auth/verify-otp", { method: "POST", body: JSON.stringify(body) }),
  login:     (body) => req("/auth/login",      { method: "POST", body: JSON.stringify(body) }),
};
 
// ── Crops ─────────────────────────────────────────────────────────────────────
export const cropAPI = {
  create:  (body) => req("/crops",         { method: "POST",   body: JSON.stringify(body) }),
  getAll:  ()     => req("/crops"),
  getById: (id)   => req(`/crops/${id}`),
  remove:  (id)   => req(`/crops/${id}`,   { method: "DELETE" }),
};
 
// ── AI ────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  getAdvice: (cropId, question = "") =>
    req("/ai/advice", { method: "POST", body: JSON.stringify({ cropId, question }) }),
 
  // Disease detection: image file → FormData → multipart POST
  detectDisease: (cropId, imageFile) => {
    const form = new FormData();
    form.append("cropId", cropId);
    form.append("image",  imageFile); // field name must match multer's uploadSingle("image")
    return req("/ai/disease-detection", { method: "POST", body: form });
  },
};
 
// ── Weather ───────────────────────────────────────────────────────────────────
export const weatherAPI = {
  byCrop:   (cropId)     => req(`/weather?cropId=${cropId}`),
  byCoords: (lat, lon)   => req(`/weather?lat=${lat}&lon=${lon}`),
};