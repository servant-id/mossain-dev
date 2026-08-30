import { Link } from "react-router-dom";
import { waProductLink } from "../lib/siteConfig";

export default function ProductCard({ img, title, desc, slug, hasFull }) {
  const isLong = desc && desc.length > 120;
  const displayDesc = isLong ? desc.slice(0, 115) + "…" : desc;
  const linkTo = `/produk/${slug}`;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-floaty">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
        <Link to={linkTo} className="block h-full w-full">
          {img ? (
            <img
              src={img}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">Gambar segera hadir</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <span className="flex translate-y-3 items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition group-hover:translate-y-0">
              <InfoIcon className="h-4 w-4" /> Info Detail
            </span>
          </div>
        </Link>
      </div>

      <h3 className="mt-3 text-left text-lg font-bold text-slate-800">
        <Link to={linkTo} className="transition hover:text-brand-600">{title}</Link>
      </h3>

      <p className="mt-1 flex-grow text-justify text-sm text-slate-600">
        {displayDesc}
        {isLong && hasFull && (
          <Link to={linkTo} className="ml-1 whitespace-nowrap text-sm font-semibold text-brand-600 hover:underline">
            Selengkapnya »
          </Link>
        )}
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {hasFull && (
          <Link
            to={linkTo}
            className="block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Lihat Detail »
          </Link>
        )}
        <a
          href={waProductLink(title)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-full bg-mint-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mint-600"
        >
          <WhatsAppIcon className="h-4 w-4" /> Konsultasi WA
        </a>
      </div>
    </div>
  );
}

function InfoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
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
