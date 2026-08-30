import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";
import { adminWrite } from "../../lib/adminApi";

export default function AdminPosts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id, title, type, status, created_at")
      .order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm("Hapus artikel ini?")) return;
    await adminWrite({ entity: "posts", action: "delete", id });
    load();
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Kelola Blog & News</h1>
        <Link to="/admin/posts/new" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + Tambah Artikel
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Memuat…</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-ink-900">{r.title}</td>
                <td className="px-4 py-3 capitalize">{r.type}</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/posts/${r.id}`} className="text-brand-600 hover:underline">Edit</Link>
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
