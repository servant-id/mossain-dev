const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const SESSION_KEY = "mossain_admin_token";

export function getStoredToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function storeToken(token) {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(SESSION_KEY);
}

export async function adminLogin(username, password) {
  const res = await fetch(`${FUNCTIONS_BASE}/mossain-admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login gagal.");
  storeToken(data.token);
  return data;
}

export async function adminVerify() {
  const token = getStoredToken();
  if (!token) return { valid: false };
  const res = await fetch(`${FUNCTIONS_BASE}/mossain-admin-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) return { valid: false };
  return res.json();
}

export function adminLogout() {
  clearToken();
}

/**
 * Generic admin write call: insert / update / delete on an allow-listed
 * entity. See supabase/functions/mossain-admin-write for the server-side
 * validation — this is just the thin client wrapper.
 */
export async function adminWrite({ entity, action, id, payload }) {
  const token = getStoredToken();
  if (!token) throw new Error("Belum login.");

  const res = await fetch(`${FUNCTIONS_BASE}/mossain-admin-write`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ entity, action, id, payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal menyimpan data.");
  return data;
}
