import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";

export default function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, main, sub, slug, title, is_active, sort_order")
      .order("main")
      .order("sub")
      .order("sort_order");
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm("Hapus produk ini? Gambar terkait juga akan terhapus.")) return;
    await adminWrite({ entity: "products", action: "delete", id });
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Kelola Produk</h1>
        <Link to="/admin/products/new" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + Tambah Produk
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Main</th>
              <th className="px-4 py-3">Sub</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Aktif</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Memuat…</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{r.main}</td>
                <td className="px-4 py-3">{r.sub}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.slug}</td>
                <td className="px-4 py-3 font-medium text-ink-900">{r.title}</td>
                <td className="px-4 py-3">{r.is_active ? "Ya" : "Tidak"}</td>
                <td className="px-4 py-3">{r.sort_order}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/products/${r.id}`} className="text-brand-600 hover:underline">Edit</Link>
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
