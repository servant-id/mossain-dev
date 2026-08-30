import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

const MAIN_OPTIONS = ["prostetik", "ortotik"];
const SUB_OPTIONS = {
  prostetik: ["prostAtas", "prostBawah"],
  ortotik: ["ortotikGlobal"],
};

const emptyForm = {
  main: "prostetik",
  sub: "prostAtas",
  slug: "",
  title: "",
  descs: [""],
  full_description: "",
  price_label: "Hubungi kami untuk informasi harga",
  processing_time: "7–21 hari kerja",
  meta_description: "",
  sort_order: 10,
  is_active: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
      if (product) {
        setForm({
          ...emptyForm,
          ...product,
          descs: Array.isArray(product.descs) && product.descs.length ? product.descs : [""],
        });
      }
      const { data: imgs } = await supabase
        .from("product_images")
        .select("id, url, cloudinary_public_id, sort_order")
        .eq("product_id", id)
        .order("sort_order");
      setImages(imgs || []);
      setLoading(false);
    })();
  }, [id, isNew]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateDesc(i, value) {
    setForm((f) => {
      const descs = [...f.descs];
      descs[i] = value;
      return { ...f, descs };
    });
  }

  function addDesc() {
    setForm((f) => ({ ...f, descs: [...f.descs, ""] }));
  }

  function removeDesc(i) {
    setForm((f) => ({ ...f, descs: f.descs.filter((_, idx) => idx !== i) }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url, publicId } = await uploadImageToCloudinary(file, `mossain/${form.slug || "produk"}`);
      if (isNew) {
        // Queue locally until the product exists; saved after insert.
        setImages((imgs) => [...imgs, { url, cloudinary_public_id: publicId, sort_order: imgs.length, _pending: true }]);
      } else {
        const res = await adminWrite({
          entity: "product_images",
          action: "insert",
          payload: { product_id: Number(id), cloudinary_public_id: publicId, url, sort_order: images.length },
        });
        setImages((imgs) => [...imgs, res.data]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteImage(img) {
    if (img._pending) {
      setImages((imgs) => imgs.filter((i) => i !== img));
      return;
    }
    await adminWrite({ entity: "product_images", action: "delete", id: img.id });
    setImages((imgs) => imgs.filter((i) => i.id !== img.id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        descs: form.descs.filter((d) => d.trim() !== ""),
        sort_order: Number(form.sort_order) || 0,
      };

      if (isNew) {
        const res = await adminWrite({ entity: "products", action: "insert", payload });
        const newId = res.data.id;
        // Flush pending Cloudinary images now that the product row exists.
        for (const img of images) {
          await adminWrite({
            entity: "product_images",
            action: "insert",
            payload: {
              product_id: newId,
              cloudinary_public_id: img.cloudinary_public_id,
              url: img.url,
              sort_order: img.sort_order,
            },
          });
        }
        navigate("/admin/products");
      } else {
        await adminWrite({ entity: "products", action: "update", id: Number(id), payload });
        navigate("/admin/products");
      }
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
        {isNew ? "Tambah Produk" : "Edit Produk"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-2xl bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField
            label="Kategori Utama"
            value={form.main}
            onChange={(v) => { updateField("main", v); updateField("sub", SUB_OPTIONS[v][0]); }}
            options={MAIN_OPTIONS}
          />
          <SelectField
            label="Sub Kategori"
            value={form.sub}
            onChange={(v) => updateField("sub", v)}
            options={SUB_OPTIONS[form.main]}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField label="Judul Produk" value={form.title} onChange={(v) => updateField("title", v)} required />
          <TextField
            label="Slug (folder/URL)"
            value={form.slug}
            onChange={(v) => updateField("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Poin Deskripsi (bullet)</label>
          <div className="space-y-2">
            {form.descs.map((d, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  value={d}
                  onChange={(e) => updateDesc(i, e.target.value)}
                  rows={2}
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <button type="button" onClick={() => removeDesc(i)} className="shrink-0 rounded-lg px-2 text-red-500 hover:bg-red-50">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addDesc} className="mt-2 text-sm font-medium text-brand-600 hover:underline">+ Tambah poin</button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Deskripsi Lengkap (opsional, HTML)</label>
          <textarea
            value={form.full_description || ""}
            onChange={(e) => updateField("full_description", e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField label="Label Harga" value={form.price_label || ""} onChange={(v) => updateField("price_label", v)} />
          <TextField label="Estimasi Pengerjaan" value={form.processing_time || ""} onChange={(v) => updateField("processing_time", v)} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField label="Urutan Tampil" type="number" value={form.sort_order} onChange={(v) => updateField("sort_order", v)} />
          <div className="flex items-center gap-2 pt-7">
            <input
              type="checkbox"
              id="is_active"
              checked={!!form.is_active}
              onChange={(e) => updateField("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Aktif (tampil di situs)</label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Galeri Gambar (Cloudinary)</label>
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id || img.url} className="group relative h-24 w-32 overflow-hidden rounded-lg border border-slate-200">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img)}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white group-hover:flex"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-400 hover:border-brand-400 hover:text-brand-500">
              {uploading ? "Mengunggah…" : "+ Unggah gambar"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Simpan Produk"}
          </button>
        </div>
      </form>
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
