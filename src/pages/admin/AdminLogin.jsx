import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { adminLogin } from "../../lib/adminApi";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLogin() {
  const { status } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authed") return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      // AdminAuthContext otomatis mendeteksi sesi baru lewat
      // onAuthStateChange, jadi tidak perlu set status manual di sini.
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-center font-display text-2xl font-bold text-ink-900">Admin Mossa</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Masuk untuk mengelola konten situs</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
