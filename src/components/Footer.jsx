import { Link } from "react-router-dom";
import { SITE } from "../lib/siteConfig";

export default function Footer() {
  return (
    <footer className="mt-20 rounded-t-3xl bg-ink-900 px-4 pb-8 pt-16 text-slate-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="mb-4 inline-flex items-center">
            <img src="/logo.png" alt="Mossa Orthopedic Care" className="h-11 w-auto brightness-0 invert" />
          </Link>
          <p className="text-sm leading-relaxed text-slate-400">
            Mossa Kaki Palsu adalah penyedia solusi agar pasien mendapatkan kembali kebebasan
            bergerak dan rasa percaya diri melalui teknologi prostetik &amp; ortotik berkualitas.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Tautan Cepat</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#tentang-kami" className="text-slate-400 transition hover:text-white">Tentang Kami</a></li>
            <li><a href="/#layanan" className="text-slate-400 transition hover:text-white">Layanan</a></li>
            <li><Link to="/form" className="text-slate-400 transition hover:text-white">Formulir Konsultasi</Link></li>
            <li><Link to="/news" className="text-slate-400 transition hover:text-white">News</Link></li>
            <li><Link to="/blog" className="text-slate-400 transition hover:text-white">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Hubungi Kami</h3>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>Email: {SITE.email}</li>
            <li>Telepon: {SITE.phoneDisplay}</li>
            {SITE.addresses.map((a) => (
              <li key={a.label}>{a.label}: {a.line}</li>
            ))}
            <li>Jam operasional: {SITE.hours}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Ikuti Kami</h3>
          <div className="flex gap-3">
            <SocialIcon href={SITE.social.linktree} label="Linktree">
              <LinktreeIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={SITE.social.instagram} label="Instagram">
              <InstagramIcon className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon href={SITE.social.whatsappCatalog} label="WhatsApp">
              <WhatsAppIcon className="h-4 w-4" />
            </SocialIcon>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Mossa Kaki Palsu.
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand-600"
    >
      {children}
    </a>
  );
}

function LinktreeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l1.5 3.5H18l-3 3 1.5 4-4.5-2.5L7.5 12.5 9 8.5 6 5.5h4.5L12 2zm-1 12h2v8h-2v-8z" />
    </svg>
  );
}
function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.668-.072-4.948C23.73 2.69 21.31.273 16.951.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.52 5.847L0 24l6.335-1.497A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.368l-.36-.213-3.76.888.934-3.665-.234-.378A9.818 9.818 0 1112 21.818z" />
    </svg>
  );
}
