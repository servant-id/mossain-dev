import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Produk" },
  { to: "/admin/testimonials", label: "Testimoni" },
  { to: "/admin/faqs", label: "FAQ" },
  { to: "/admin/settings", label: "Pengaturan Tampilan" },
];

export default function AdminShell({ children }) {
  const { username, logout } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white p-5 md:block">
        <p className="mb-8 font-display text-lg font-bold text-ink-900">Mossa Admin</p>
        <nav className="space-y-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-10 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs text-slate-400">Masuk sebagai {username}</p>
          <button onClick={logout} className="text-sm font-medium text-red-600 hover:underline">
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
