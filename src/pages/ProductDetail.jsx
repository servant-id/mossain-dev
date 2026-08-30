import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { fetchProductBySlug } from "../lib/content";
import { waProductLink } from "../lib/siteConfig";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetchProductBySlug(slug)
      .then((p) => {
        if (cancelled) return;
        if (!p) setNotFound(true);
        else setProduct(p);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-24 text-center text-slate-400">Memuat…</div>
      </Layout>
    );
  }

  if (notFound || !product) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-700">Produk Tidak Ditemukan</h1>
          <Link to="/" className="mt-6 inline-block text-brand-600 hover:underline">← Kembali ke Beranda</Link>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length ? product.images.map((i) => i.url) : [];
  const bullets = Array.isArray(product.descs) ? product.descs : [];
  const hasFullDesc = !!product.full_description?.trim();

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <nav className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-brand-600">Home</Link> <span className="mx-1">//</span>{" "}
          <Link to="/produk" className="hover:text-brand-600">Produk</Link> <span className="mx-1">//</span> {product.title}
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-card">
              {images.length ? (
                <img src={images[activeImg]} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Gambar segera hadir</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-20 overflow-hidden rounded-lg border-2 transition ${
                      activeImg === i ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900 md:text-4xl">{product.title}</h1>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {product.price_label && (
                <span className="rounded-full bg-brand-50 px-4 py-1.5 font-medium text-brand-700">{product.price_label}</span>
              )}
              {product.processing_time && (
                <span className="rounded-full bg-mint-50 px-4 py-1.5 font-medium text-mint-600">
                  ⏱ {product.processing_time}
                </span>
              )}
            </div>

            {bullets.length > 0 && (
              <ul className="mt-6 space-y-3">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-slate-700">
                    <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-mint-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <a
              href={waProductLink(product.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-mint-500 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-mint-600 sm:w-auto sm:px-8"
            >
              <WhatsAppIcon className="h-5 w-5" /> Konsultasi via WhatsApp
            </a>
          </div>
        </div>

        {hasFullDesc && (
          <div className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold text-ink-900">Deskripsi Lengkap</h2>
            <div
              className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-brand-600"
              dangerouslySetInnerHTML={{ __html: product.full_description }}
            />
          </div>
        )}
      </section>
    </Layout>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
