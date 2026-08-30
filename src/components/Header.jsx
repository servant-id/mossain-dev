import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

// Struktur menu sesuai brief: Home, Booking (form konsultasi/keluhan),
// Tentang Kami (dropdown: profil, testimoni, lokasi, FAQ), Produk
// (galeri katalog), Kontak (footer). Tidak ada top-bar kontak — header
// dibuat "frozen" satu baris saja, kontak lengkap ada di footer.
const SIMPLE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/booking", label: "Booking" },
];

const TENTANG_KAMI_LINKS = [
  { to: "/tentang-kami", label: "Profil Mossa" },
  { to: "/tentang-kami#testimoni", label: "Testimoni" },
  { to: "/tentang-kami#lokasi", label: "Lokasi Kami" },
  { to: "/tentang-kami#faq", label: "FAQ" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tentangKamiOpen, setTentangKamiOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setTentangKamiOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="Mossa Orthopedic Care" className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {SIMPLE_LINKS.map((item) => (
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
          ))}

          <DesktopDropdown label="Tentang Kami" links={TENTANG_KAMI_LINKS} />

          <NavLink
            to="/produk"
            className={({ isActive }) =>
              `text-[15px] font-medium transition hover:text-brand-700 ${
                isActive ? "text-brand-700" : "text-slate-600"
              }`
            }
          >
            Produk
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link
            to="/booking"
            className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-floaty transition hover:bg-brand-700 lg:inline-flex"
          >
            Booking Konsultasi
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
          {SIMPLE_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={() => setTentangKamiOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
          >
            Tentang Kami <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {tentangKamiOpen && (
            <div className="space-y-1 pl-4">
              {TENTANG_KAMI_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/produk"
            onClick={() => setMobileOpen(false)}
            className="block rounded-md py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Produk
          </Link>
        </div>
      )}
    </header>
  );
}

function DesktopDropdown({ label, links }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="flex items-center gap-1 text-[15px] font-medium text-slate-600 transition hover:text-brand-700"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <div
        className={`absolute left-0 z-50 mt-2 w-48 origin-top rounded-xl border border-slate-100 bg-white p-1 shadow-card transition ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
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
