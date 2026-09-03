import { useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const emptyForm = {
  image_url: "",
  eyebrow: "",
  title: "",
  description: "",
  cta_text: "",
  cta_url: "/produk",
  status: "published",
  sort_order: 0,
};

export default function AdminHeroBanners() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("hero_banners")
      .select("id, image_url, eyebrow, title, description, cta_text, cta_url, status, sort_order")
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadImageToCloudinary(file, "mossain/hero-banners");
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.image_url) {
      setError("Unggah gambar banner terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      if (editingId) {
        await adminWrite({ entity: "hero_banners", action: "update", id: editingId, payload });
      } else {
        await adminWrite({ entity: "hero_banners", action: "insert", payload });
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
    if (!confirm("Hapus banner ini?")) return;
    await adminWrite({ entity: "hero_banners", action: "delete", id });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <AdminShell>
      <h1 className="mb-2 font-display text-2xl font-bold text-ink-900">Kelola Hero Banner</h1>
      <p className="mb-6 text-sm text-slate-500">
        Banner ini tampil di slider hero halaman Home. Urutan ditentukan oleh "Urutan Tampil" —
        angka terkecil tampil paling awal (jadi "banner utama"/top).
      </p>

      <form onSubmit={handleSubmit} className="mb-8 max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-slate-500">
          {editingId ? "Edit Banner" : "Tambah Banner Baru"}
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Gambar Banner</label>
          <div className="flex items-center gap-4">
            {form.image_url && (
              <img src={form.image_url} alt="" className="h-20 w-28 rounded-lg object-cover" />
            )}
            <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-600">
              {uploading ? "Mengunggah…" : "Unggah gambar"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Disarankan satu foto perwakilan per kategori (mis. satu untuk Prostetik, satu untuk
            Ortotik) — bukan seluruh katalog.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Label Kategori (eyebrow)" value={form.eyebrow || ""} onChange={(v) => setForm((f) => ({ ...f, eyebrow: v }))} placeholder="mis. Prostetik" />
          <TextField label="Judul Singkat" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi Singkat</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Teks Tombol (opsional)" value={form.cta_text || ""} onChange={(v) => setForm((f) => ({ ...f, cta_text: v }))} placeholder="mis. Lihat Produk" />
          <TextField label="Link Tombol" value={form.cta_url || ""} onChange={(v) => setForm((f) => ({ ...f, cta_url: v }))} placeholder="/produk" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <TextField label="Urutan Tampil (kecil = di depan/top)" type="number" value={form.sort_order} onChange={(v) => setForm((f) => ({ ...f, sort_order: v }))} />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Tambah Banner"}
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
              <th className="px-4 py-3">Gambar</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Memuat…</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <img src={r.image_url} alt="" className="h-10 w-14 rounded object-cover" />
                </td>
                <td className="px-4 py-3 font-medium text-ink-900">{r.title}</td>
                <td className="px-4 py-3">{r.sort_order}</td>
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

function TextField({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
