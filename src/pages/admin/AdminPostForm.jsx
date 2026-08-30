import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  content_html: "",
  author: "Mossa Admin",
  type: "blog",
  status: "published",
  featured_image: "",
  video_url: "",
  slug: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  canonical_url: "",
  og_image: "",
};

export default function AdminPostForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", id).single();
      if (data) setForm({ ...emptyForm, ...data });
      setLoading(false);
    })();
  }, [id, isNew]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function autoSlug() {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    update("slug", slug);
  }

  async function handleFeaturedUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadImageToCloudinary(file, "mossain/posts");
      update("featured_image", url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        await adminWrite({ entity: "posts", action: "insert", payload: form });
      } else {
        await adminWrite({ entity: "posts", action: "update", id: Number(id), payload: form });
      }
      navigate("/admin/posts");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-slate-400">Memuat…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">
        {isNew ? "Tambah Artikel" : "Edit Artikel"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField label="Tipe" value={form.type} onChange={(v) => update("type", v)} options={["blog", "news"]} />
          <SelectField label="Status" value={form.status} onChange={(v) => update("status", v)} options={["draft", "published"]} />
        </div>

        <TextField label="Judul" value={form.title} onChange={(v) => update("title", v)} required />

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="Slug (URL)" value={form.slug} onChange={(v) => update("slug", v)} required />
          </div>
          <button type="button" onClick={autoSlug} className="mb-0.5 rounded-lg border border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            Buat dari judul
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Ringkasan / Snippet (plain text)</label>
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={3}
            required
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Isi Artikel (HTML)</label>
          <textarea
            value={form.content_html || ""}
            onChange={(e) => update("content_html", e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Gambar Utama (Cloudinary)</label>
          <div className="flex items-center gap-4">
            {form.featured_image && (
              <img src={form.featured_image} alt="" className="h-20 w-28 rounded-lg object-cover" />
            )}
            <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-600">
              {uploading ? "Mengunggah…" : "Unggah gambar"}
              <input type="file" accept="image/*" onChange={handleFeaturedUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <TextField label="URL Video (opsional, YouTube/Drive)" value={form.video_url || ""} onChange={(v) => update("video_url", v)} />
        <TextField label="Penulis" value={form.author} onChange={(v) => update("author", v)} />

        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">SEO</legend>
          <div className="space-y-4 pt-2">
            <TextField label="Meta Title" value={form.meta_title || ""} onChange={(v) => update("meta_title", v)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Meta Description</label>
              <textarea
                value={form.meta_description || ""}
                onChange={(e) => update("meta_description", e.target.value)}
                rows={2}
                maxLength={160}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <TextField label="Meta Keywords" value={form.meta_keywords || ""} onChange={(v) => update("meta_keywords", v)} />
            <TextField label="Canonical URL" value={form.canonical_url || ""} onChange={(v) => update("canonical_url", v)} />
          </div>
        </fieldset>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Menyimpan…" : "Simpan Artikel"}
        </button>
      </form>
    </AdminShell>
  );
}

function TextField({ label, value, onChange, required }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
