import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS = [
  { to: "/", label: "Beranda", end: true },
  { to: "/#tentang-kami", label: "Tentang Kami", hash: true },
  { to: "/#solusi", label: "Produk", hash: true },
  { to: "/#layanan", label: "Layanan", hash: true },
  { to: "/form", label: "Form Konsultasi" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [terbaruOpen, setTerbaruOpen] = useState(false);

  // Frozen header: single fixed height, no secondary contact bar. Contact
  // details live in the footer only, per the brief.
  useEffect(() => {
    if (!mobileOpen) setTerbaruOpen(false);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="Mossa Orthopedic Care" className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((item) =>
            item.hash ? (
              <a key={item.to} href={item.to} className="text-[15px] font-medium text-slate-600 transition hover:text-brand-700">
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-[15px] font-medium transition hover:text-brand-700 ${
                    isActive ? "text-brand-700" : "text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}

          <div className="group relative">
            <button className="flex items-center gap-1 text-[15px] font-medium text-slate-600 transition hover:text-brand-700">
              Terbaru
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-0 z-50 mt-2 w-36 origin-top scale-95 rounded-xl border border-slate-100 bg-white p-1 opacity-0 shadow-card transition group-hover:visible group-hover:scale-100 group-hover:opacity-100">
              <Link to="/news" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700">News</Link>
              <Link to="/blog" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700">Blog</Link>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link
            to="/form"
            className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-floaty transition hover:bg-brand-700 lg:inline-flex"
          >
            Konsultasi
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 lg:hidden"
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          <div className="mb-3 sm:hidden">
            <LanguageSwitcher />
          </div>
          {NAV_LINKS.map((item) =>
            item.hash ? (
              <a
                key={item.to}
                href={item.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            )
          )}
          <button
            onClick={() => setTerbaruOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
          >
            Terbaru <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {terbaruOpen && (
            <div className="space-y-1 pl-4">
              <Link to="/news" onClick={() => setMobileOpen(false)} className="block rounded-md py-1.5 text-slate-600 hover:bg-slate-50">News</Link>
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="block rounded-md py-1.5 text-slate-600 hover:bg-slate-50">Blog</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function ChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
function ArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
