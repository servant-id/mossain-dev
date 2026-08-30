import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, testimonials: 0, faqs: 0 });
  const [recentTestimonials, setRecentTestimonials] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ count: productCount }, { count: testimonialCount }, { count: faqCount }, { data: recent }] =
        await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("testimonials").select("id", { count: "exact", head: true }),
          supabase.from("faqs").select("id", { count: "exact", head: true }),
          supabase.from("testimonials").select("id, patient_name, rating, created_at").order("created_at", { ascending: false }).limit(10),
        ]);
      setStats({ products: productCount || 0, testimonials: testimonialCount || 0, faqs: faqCount || 0 });
      setRecentTestimonials(recent || []);
    })();
  }, []);

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Produk" value={stats.products} to="/admin/products" />
        <StatCard label="Total Testimoni" value={stats.testimonials} to="/admin/testimonials" />
        <StatCard label="Total FAQ" value={stats.faqs} to="/admin/faqs" />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Testimoni Terbaru</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-3">Nama Pasien</th>
              <th className="pb-3">Rating</th>
              <th className="pb-3">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {recentTestimonials.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="py-2.5 font-medium text-ink-900">{t.patient_name}</td>
                <td className="py-2.5 text-slate-500">{t.rating} ★</td>
                <td className="py-2.5 text-slate-500">{new Date(t.created_at).toLocaleDateString("id-ID")}</td>
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
