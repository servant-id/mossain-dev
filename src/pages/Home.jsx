import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ProductSlider from "../components/ProductSlider";
import HeroSlider from "../components/HeroSlider";
import {
  fetchProductCategories,
  fetchImagesForProducts,
  fetchSettings,
  fetchHeroBanners,
} from "../lib/content";
import { waLink, WA_CONSULT_MESSAGE } from "../lib/siteConfig";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [imagesByProduct, setImagesByProduct] = useState({});
  const [settings, setSettings] = useState({ show_layanan: true });
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, sett, banners] = await Promise.all([
          fetchProductCategories(),
          fetchSettings(),
          fetchHeroBanners(),
        ]);
        const allIds = cats.flatMap((c) => c.subcategories.flatMap((s) => s.products.map((p) => p.id)));
        const imgs = await fetchImagesForProducts(allIds);
        if (cancelled) return;
        setCategories(cats);
        setSettings(sett);
        setHeroBanners(banners);
        setImagesByProduct(imgs);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sliderGroups = useMemo(() => buildSliderGroups(categories, imagesByProduct), [categories, imagesByProduct]);

  return (
    <Layout>
      <Hero banners={heroBanners} />
      <CategoryHighlights />
      {settings.show_layanan && !loading && <ServicesSliders groups={sliderGroups} />}
      <CtaBanner />
    </Layout>
  );
}

const FALLBACK_SLIDE = [
  { id: "fallback", image_url: "/hero-prosthetic.jpg", eyebrow: "", title: "", description: "" },
];

function Hero({ banners }) {
  const slides = banners.length > 0 ? banners : FALLBACK_SLIDE;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-24">
        {/* Judul & badge full-width di atas — supaya tetap terbaca lega di
            layar kecil, tidak ikut dipaksa jadi kolom sempit. */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            <BadgeIcon className="h-4 w-4" /> Ditangani Praktisi Lokal yang Telaten &amp; Teliti
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl md:mt-6 md:text-5xl">
            Kembali Bergerak, Kembali Bebas Melangkah
          </h1>
        </div>

        {/* Dari HP: teks & gambar berdampingan 2 kolom supaya gambar
            langsung terlihat tanpa scroll. Dari md ke atas: proporsi
            teks diperlebar sedikit karena ruang lebih longgar. */}
        <div className="mt-6 grid grid-cols-5 items-start gap-4 sm:gap-6 md:mt-8 md:grid-cols-2 md:items-center md:gap-10">
          <div className="col-span-3 md:col-span-1">
            <p className="text-sm text-white/90 sm:text-base md:text-lg">
              Mossa Orthopedic Care menghadirkan layanan prostetik, ortotik, dan brace yang
              dirancang custom sesuai kondisi pasien — profesional, ramah, dan lugas dari
              konsultasi hingga proses fitting.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row md:mt-9 md:gap-3">
              <Link to="/produk" className="rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold text-brand-700 shadow-lg transition hover:-translate-y-0.5 sm:px-7 sm:py-3 sm:text-base">
                Lihat Produk Kami
              </Link>
              <Link to="/booking" className="rounded-full border-2 border-white/80 px-5 py-2.5 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-700 sm:px-7 sm:py-3 sm:text-base">
                Booking Konsultasi
              </Link>
            </div>
          </div>

          <div className="relative col-span-2 md:col-span-1">
            <HeroSlider slides={slides} />
            <div className="absolute -bottom-3 -left-2 max-w-[85%] rounded-xl bg-white px-3 py-2 text-ink-900 shadow-floaty sm:-bottom-6 sm:-left-6 sm:max-w-none sm:rounded-2xl sm:px-5 sm:py-4">
              <p className="text-sm font-bold text-accent-500 sm:text-2xl">Custom Fit</p>
              <p className="hidden text-sm text-slate-500 sm:block">Soket &amp; brace sesuai anatomi pasien</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 -bottom-1 h-16 rounded-t-[3rem] bg-slate-50" />
    </section>
  );
}

const CATEGORY_CARDS = [
  {
    title: "Prostetik",
    desc: "Kaki, tangan, dan jari palsu yang dibuat custom untuk mengembalikan mobilitas dan kepercayaan diri Anda.",
    to: "/produk",
  },
  {
    title: "Ortotik",
    desc: "Penyangga dan koreksi postur tubuh untuk membantu pemulihan dan aktivitas sehari-hari.",
    to: "/produk",
  },
  {
    title: "Brace & Alat Bantu",
    desc: "MSO brace skoliosis, Dennis splint CTEV, hingga AFO anak — solusi penunjang tumbuh kembang.",
    to: "/produk",
  },
];

function CategoryHighlights() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">
        Layanan Utama Kami
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
        Fokus pada perawatan ortopedi — prostetik dan ortotik — dengan pendampingan yang ramah dari
        awal konsultasi sampai alat siap digunakan.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {CATEGORY_CARDS.map((c) => (
          <div key={c.title} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="text-xl font-bold text-ink-900">{c.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{c.desc}</p>
            <Link to={c.to} className="mt-5 text-sm font-semibold text-brand-600 hover:underline">
              Lihat Produk →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/tentang-kami" className="inline-flex items-center gap-1.5 text-base font-semibold text-brand-600 hover:underline">
          Selengkapnya Tentang Kami →
        </Link>
      </div>
    </section>
  );
}

function ServicesSliders({ groups }) {
  return (
    <section className="mx-auto max-w-6xl rounded-3xl bg-white px-4 py-20 shadow-card">
      <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">Produk Pilihan</h2>

      <h3 className="mt-12 mb-6 text-center text-2xl font-bold text-ink-900">Prostetik</h3>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductSlider title="Anggota Gerak Atas" items={groups.prostAtas} perViewDesktop={2} perViewMobile={1} />
        <ProductSlider title="Anggota Gerak Bawah" items={groups.prostBawah} perViewDesktop={2} perViewMobile={1} />
      </div>

      <h3 className="mt-16 mb-6 text-center text-2xl font-bold text-ink-900">Ortotik</h3>
      <ProductSlider
        title="MSO Brace, Dennis Splint CTEV, AFO Anak"
        items={groups.ortotik}
        perViewDesktop={2}
        perViewMobile={1}
        showTitle={false}
      />

      <div className="mt-14 text-center">
        <Link to="/produk" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700">
          Lihat Semua Produk
        </Link>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-14 text-center text-white">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Siap Konsultasi dengan Tim Kami?</h2>
        <p className="max-w-xl text-white/90">
          Ceritakan kondisi atau kebutuhan Anda — tim praktisi Mossa siap membantu menentukan solusi
          yang tepat.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/booking" className="rounded-full bg-white px-7 py-3 text-base font-semibold text-brand-700 shadow-lg transition hover:-translate-y-0.5">
            Booking Konsultasi
          </Link>
          <a
            href={waLink(WA_CONSULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-white/80 px-7 py-3 text-base font-semibold transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-700"
          >
            Chat WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/** Round-robin item builder — mirrors build_items_roundrobin() from index.php. */
function buildSliderGroups(categories, imagesByProduct) {
  const bySlug = { prostAtas: [], prostBawah: [], ortotik: [] };

  for (const main of categories) {
    for (const sub of main.subcategories) {
      const bucket = sub.id === "ortotikGlobal" ? "ortotik" : sub.id;
      if (!bySlug[bucket]) continue;
      for (const product of sub.products) bySlug[bucket].push(product);
    }
  }

  const N_MAX = 4;
  const out = {};
  for (const key of Object.keys(bySlug)) {
    out[key] = roundRobinItems(bySlug[key], imagesByProduct, N_MAX);
  }
  return out;
}

function roundRobinItems(products, imagesByProduct, limit) {
  const items = [];
  const idxByProduct = {};
  const descIdxByProduct = {};
  let progress = true;

  while (items.length < limit && progress) {
    progress = false;
    for (const p of products) {
      const imgs = imagesByProduct[p.id] || [];
      const i = idxByProduct[p.id] || 0;
      if (imgs[i]) {
        const di = descIdxByProduct[p.id] || 0;
        const pool = p.descs.length ? p.descs : [""];
        items.push({
          img: imgs[i],
          title: p.title,
          desc: pool[di % pool.length],
          slug: p.slug,
          hasFull: p.has_full,
        });
        idxByProduct[p.id] = i + 1;
        descIdxByProduct[p.id] = di + 1;
        progress = true;
        if (items.length >= limit) break;
      } else {
        idxByProduct[p.id] = i + 1;
      }
    }
  }
  return items;
}

function BadgeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="8" r="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5L6 21l6-3 6 3-2.5-8.5" />
    </svg>
  );
}
