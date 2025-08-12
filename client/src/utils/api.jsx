const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000").trim();
export const API_URL = base.startsWith("http") ? base : "http://127.0.0.1:5000";

console.log("[api] base:", API_URL);

async function jsonReq(path, { method = "GET", body, token } = {}) {
  const r = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await r.json();
  } catch {}

  if (!r.ok) throw new Error(data?.error || `${r.status} ${r.statusText}`);
  return data;
}

export const api = {
  
  // --- auth  ---
  register: (user) =>
    jsonReq("/api/auth/register", { method: "POST", body: user }),
  login: (creds) => jsonReq("/api/auth/login", { method: "POST", body: creds }),
  me: (token) => jsonReq("/api/auth/me", { token }),

  // --- expenses, summary ---
  expenses: () => jsonReq("/api/expenses"),
  summary: () => jsonReq("/api/summary"),

 
  uploadReceipt: async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const r = await fetch(`${API_URL}/api/receipt`, {
      method: "POST",
      body: fd,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "Upload failed");
    return data;
  },


  presign: async (file) => {
    const r = await fetch(`${API_URL}/api/receipt/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mime: file.type || "application/octet-stream",
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "presign failed");
    return data; 
  },

 
  uploadToS3: async (presigned, file) => {
    const form = new FormData();
    Object.entries(presigned.fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file);

    const r = await fetch(presigned.url, { method: "POST", body: form });
    if (!r.ok) {
     
      const xml = await r.text().catch(() => "");
      const msg =
        /<Message>(.*?)<\/Message>/i.exec(xml)?.[1] || "S3 upload failed";
      throw new Error(msg);
    }
  },

  confirm: async ({ key, file }) => {
    const r = await fetch(`${API_URL}/api/receipt/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "confirm failed");
    return data;
  },
};
