import { useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";

const emptyForm = { patient_name: "", location: "", rating: 5, content: "", status: "published", sort_order: 0 };

export default function AdminTestimonials() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("id, patient_name, location, rating, content, status, sort_order")
      .order("sort_order");
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ ...row });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, rating: Number(form.rating), sort_order: Number(form.sort_order) || 0 };
      if (editingId) {
        await adminWrite({ entity: "testimonials", action: "update", id: editingId, payload });
      } else {
        await adminWrite({ entity: "testimonials", action: "insert", payload });
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus testimoni ini?")) return;
    await adminWrite({ entity: "testimonials", action: "delete", id });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Kelola Testimoni</h1>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-slate-500">
          {editingId ? "Edit Testimoni" : "Tambah Testimoni Baru"}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Nama Pasien" value={form.patient_name} onChange={(v) => setForm((f) => ({ ...f, patient_name: v }))} required />
          <TextField label="Lokasi (opsional)" value={form.location || ""} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} bintang</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="published">Tampil di situs</option>
              <option value="draft">Draft (disembunyikan)</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Isi Testimoni</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={3}
            required
            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <TextField label="Urutan Tampil" type="number" value={form.sort_order} onChange={(v) => setForm((f) => ({ ...f, sort_order: v }))} />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Tambah Testimoni"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Memuat…</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-ink-900">{r.patient_name}</td>
                <td className="px-4 py-3">{r.rating} ★</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(r)} className="text-brand-600 hover:underline">Edit</button>
                  <span className="mx-1.5 text-slate-300">|</span>
                  <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function TextField({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
