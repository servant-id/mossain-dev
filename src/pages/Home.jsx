import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ProductSlider from "../components/ProductSlider";
import {
  fetchProductCategories,
  fetchImagesForProducts,
  fetchSettings,
  fetchVideos,
} from "../lib/content";
import { waLink, WA_CONSULT_MESSAGE, SITE } from "../lib/siteConfig";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [imagesByProduct, setImagesByProduct] = useState({});
  const [settings, setSettings] = useState({ show_solusi: true, show_layanan: true, show_video: false });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, sett, vids] = await Promise.all([
          fetchProductCategories(),
          fetchSettings(),
          fetchVideos(),
        ]);
        const allIds = cats.flatMap((c) => c.subcategories.flatMap((s) => s.products.map((p) => p.id)));
        const imgs = await fetchImagesForProducts(allIds);
        if (cancelled) return;
        setCategories(cats);
        setSettings(sett);
        setVideos(vids);
        setImagesByProduct(imgs);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sliderGroups = useMemo(() => {
    return buildSliderGroups(categories, imagesByProduct);
  }, [categories, imagesByProduct]);

  return (
    <Layout>
      <Hero />
      <About />
      {settings.show_solusi && <SolutionShowcase />}
      {settings.show_video && videos.length > 0 && <VideoDemo videos={videos} />}
      {settings.show_layanan && !loading && <ServicesSliders groups={sliderGroups} />}
    </Layout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            <BadgeIcon className="h-4 w-4" /> Spesialis Prostetik &amp; Ortotik Terpercaya
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-5xl">
            Kembali Bergerak, <br className="hidden sm:block" />Kembali Bebas Melangkah
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            Kami menghadirkan solusi prostetik dan ortotik berkualitas tinggi untuk membantu Anda
            mendapatkan kembali kebebasan bergerak, mobilitas, dan kepercayaan diri.
          </p>
          <ul className="mt-8 space-y-2.5 text-white/95">
            <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0" /> Prostetik: Kaki, Tangan &amp; Jari Palsu</li>
            <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0" /> Ortotik: Korset, Penyangga Lutut, Kaki, Punggung &amp; MSO Scoliosis</li>
            <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0" /> Desain kustomisasi sesuai kebutuhan pasien</li>
          </ul>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#solusi" className="rounded-full bg-white px-7 py-3 text-center text-base font-semibold text-brand-700 shadow-lg transition hover:-translate-y-0.5">
              Lihat Produk Kami
            </a>
            <a
              href={waLink(WA_CONSULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-white/80 px-7 py-3 text-center text-base font-semibold transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-700"
            >
              Konsultasi Gratis
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border-4 border-white/20 shadow-floaty">
            <img
              src="/hero-prosthetic.jpg"
              alt="Solusi prostetik dan ortotik Mossa"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white px-5 py-4 text-ink-900 shadow-floaty sm:block">
            <p className="text-2xl font-bold text-accent-500">Custom Fit</p>
            <p className="text-sm text-slate-500">Soket &amp; brace sesuai anatomi pasien</p>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 -bottom-1 h-16 rounded-t-[3rem] bg-slate-50" />
    </section>
  );
}

function About() {
  return (
    <section id="tentang-kami" className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">
        Tentang Mossa – Solusi Gerak dan Dukungan Tubuh
      </h2>

      <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6 text-justify leading-relaxed text-slate-700">
          <p>
            Sejak awal berdiri, Mossa Kaki Palsu memiliki misi membantu pasien mendapatkan kembali
            bergerak, kembali bebas melangkah dengan rasa percaya diri melalui teknologi prostetik
            &amp; ortotik berkualitas.
          </p>
          <p>
            Dengan dukungan tim profesional di bidang prostetik &amp; ortotik, kami memproduksi
            setiap alat dengan presisi, kenyamanan, dan keamanan sebagai prioritas utama.
          </p>
          <p>
            Kami percaya bahwa setiap langkah aktivitas Anda berarti, dan kami siap mendukung
            perjalanan Anda menuju hidup yang lebih aktif dan mandiri.
          </p>

          <h3 className="pt-4 text-2xl font-bold text-ink-900">Visi</h3>
          <p>Menjadi penyedia solusi prostetik dan ortotik terdepan di Indonesia.</p>

          <h3 className="text-2xl font-bold text-ink-900">Misi</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Menyediakan produk berkualitas tinggi yang ergonomis dan aman.</li>
            <li>Memberikan layanan konsultasi dan desain sesuai kebutuhan pasien.</li>
            <li>Mendukung proses rehabilitasi agar pasien dapat beraktivitas dengan percaya diri.</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <img
            src="/team.jpg"
            alt="Tim Mossa Orthopedic Care"
            className="h-72 w-72 rounded-3xl object-cover shadow-floaty md:h-96 md:w-96"
          />
        </div>
      </div>

      <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
        <a href={waLink(WA_CONSULT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-brand-600 px-8 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:bg-brand-700">
          Hubungi Kami
        </a>
        <a href={waLink(WA_CONSULT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-brand-600 bg-white px-8 py-3 text-center text-base font-semibold text-brand-600 transition hover:bg-brand-50">
          Jadwalkan Konsultasi
        </a>
      </div>

      <h3 className="mt-20 text-center text-2xl font-bold text-ink-900">Lokasi Kami</h3>
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {SITE.addresses.map((loc) => (
          <div key={loc.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink-900">
              <PinIcon className="h-5 w-5 text-brand-600" /> {loc.label}
            </h4>
            <iframe
              src={loc.embedSrc}
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mb-4 w-full rounded-xl"
              title={loc.label}
            />
            <p className="mb-3 text-justify text-sm leading-relaxed text-slate-600">{loc.line}</p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <a href={loc.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                🗺 Lihat di Google Maps
              </a>
              <a href={waLink(`Halo Mossa, ingin kunjungi kantor ${loc.label}`)} target="_blank" rel="noopener noreferrer" className="text-mint-600 hover:underline">
                💬 WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SolutionShowcase() {
  return (
    <section id="solusi" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">Produk Kami</h2>
        <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xl font-semibold text-ink-900">Kategori: Alat Prostetik &amp; Ortotik</p>
            <p className="mt-4 text-justify leading-relaxed text-slate-700">
              Produk Mossa (&ldquo;langkah&rdquo; dalam bahasa Italia) adalah alat bantu gerak premium yang
              dirancang untuk menggantikan fungsi anggota tubuh yang hilang (misalnya kaki atau tangan)
              atau menopang bagian tubuh yang mengalami kelemahan/cedera, seperti penyangga tulang
              belakang, lutut, kaki, atau lengan. Terbuat dari bahan berkualitas tinggi yang ringan namun
              kuat, memberikan kenyamanan, keamanan, dan mobilitas yang optimal bagi penggunanya.
            </p>

            <h3 className="mt-6 text-2xl font-bold text-ink-900">Keunggulan</h3>
            <ul className="mt-3 space-y-2.5 text-slate-700">
              <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-mint-500" /> Ergonomis &amp; nyaman — mengikuti kontur tubuh pasien</li>
              <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-mint-500" /> Bahan medis ringan &amp; kuat</li>
              <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-mint-500" /> Support maksimal untuk aktivitas sehari-hari</li>
              <li className="flex items-start gap-2"><CheckIcon className="mt-1 h-5 w-5 shrink-0 text-mint-500" /> Custom sesuai kebutuhan pasien</li>
            </ul>
          </div>
          <img src="/product-showcase.jpg" alt="Produk Mossa" className="rounded-3xl shadow-floaty" />
        </div>
      </div>
    </section>
  );
}

function VideoDemo({ videos }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">Video Demo</h2>
      <div className={`mt-10 grid gap-6 ${videos.length === 1 ? "mx-auto max-w-3xl grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {videos.map((v, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-black shadow-card">
            <div className="relative aspect-video">
              <iframe
                src={v.src}
                title={v.title || "Video"}
                loading="lazy"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {v.title && <p className="p-3 text-sm font-medium text-slate-700">{v.title}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSliders({ groups }) {
  return (
    <section id="layanan" className="mx-auto max-w-6xl rounded-3xl bg-white px-4 py-20 shadow-card">
      <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">Layanan Utama</h2>

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
        <Link to="/form" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700">
          Konsultasi Kebutuhan Anda
        </Link>
      </div>
    </section>
  );
}

/** Round-robin item builder — mirrors build_items_roundrobin() from index.php. */
function buildSliderGroups(categories, imagesByProduct) {
  const bySlug = {
    prostAtas: [],
    prostBawah: [],
    ortotik: [],
  };

  for (const main of categories) {
    for (const sub of main.subcategories) {
      const bucket = sub.id === "ortotikGlobal" ? "ortotik" : sub.id;
      if (!bySlug[bucket]) continue;
      for (const product of sub.products) {
        bySlug[bucket].push(product);
      }
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

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function BadgeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="8" r="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5L6 21l6-3 6 3-2.5-8.5" />
    </svg>
  );
}
function PinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
