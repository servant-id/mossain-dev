import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, products: 0 });
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ count: postCount }, { count: productCount }, { data: recent }] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id, title, type, created_at").order("created_at", { ascending: false }).limit(10),
      ]);
      setStats({ posts: postCount || 0, products: productCount || 0 });
      setRecentPosts(recent || []);
    })();
  }, []);

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Artikel" value={stats.posts} to="/admin/posts" />
        <StatCard label="Total Produk" value={stats.products} to="/admin/products" />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Artikel Terbaru</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-3">Judul</th>
              <th className="pb-3">Tipe</th>
              <th className="pb-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {recentPosts.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2.5 font-medium text-ink-900">{p.title}</td>
                <td className="py-2.5 capitalize text-slate-500">{p.type}</td>
                <td className="py-2.5 text-slate-500">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, to }) {
  return (
    <Link to={to} className="rounded-2xl bg-white p-6 shadow-card transition hover:shadow-floaty">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-brand-700">{value}</p>
    </Link>
  );
}
