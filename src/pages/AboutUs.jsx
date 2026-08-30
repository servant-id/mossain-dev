import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import { fetchTestimonials, fetchFaqs } from "../lib/content";
import { SITE, waLink } from "../lib/siteConfig";

export default function AboutUs() {
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchTestimonials().then(setTestimonials).catch(console.error);
    fetchFaqs().then(setFaqs).catch(console.error);
  }, []);

  // Lompat ke section yang benar kalau URL punya hash (#testimoni, #lokasi, #faq)
  // — dipanggil setelah konten dari Supabase termuat supaya elemen sudah ada.
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [testimonials, faqs]);

  return (
    <Layout>
      <PageHero title="Tentang Kami" />

      {/* Profil */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-justify leading-relaxed text-slate-700">
            <p>
              Mossa Orthopedic Care hadir untuk membantu pasien kembali bergerak dan kembali bebas
              melangkah. Kami fokus pada layanan prostetik (kaki dan tangan palsu) serta ortotik
              (brace dan penyangga tubuh), ditangani langsung oleh praktisi lokal yang telaten dan
              teliti dalam setiap tahap penanganan.
            </p>
            <p>
              Setiap alat dibuat secara custom mengikuti kondisi anatomi masing-masing pasien —
              bukan produk massal — supaya hasilnya benar-benar pas, nyaman, dan aman digunakan
              untuk aktivitas sehari-hari.
            </p>
            <p>
              Kami percaya proses pemulihan bukan cuma soal alat, tapi juga pendampingan yang
              ramah dan komunikatif dari awal konsultasi sampai proses fitting selesai.
            </p>

            <h2 className="pt-4 text-2xl font-bold text-ink-900">Visi</h2>
            <p>Menjadi penyedia solusi prostetik dan ortotik terdepan di Indonesia.</p>

            <h2 className="text-2xl font-bold text-ink-900">Misi</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Menyediakan produk berkualitas tinggi yang ergonomis dan aman.</li>
              <li>Memberikan layanan konsultasi dan desain sesuai kebutuhan pasien.</li>
              <li>Mendukung proses rehabilitasi agar pasien dapat beraktivitas dengan percaya diri.</li>
            </ul>
          </div>

          <img
            src="/team.jpg"
            alt="Tim Mossa Orthopedic Care"
            className="mx-auto h-80 w-80 rounded-3xl object-cover shadow-floaty md:h-96 md:w-96"
          />
        </div>
      </section>

      {/* Testimoni */}
      <section id="testimoni" className="scroll-mt-24 bg-white px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">
            Apa Kata Pasien Kami
          </h2>

          {testimonials.length === 0 ? (
            <p className="mt-8 text-center text-slate-400">Testimoni akan segera hadir.</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-card">
                  <div className="mb-3 flex gap-0.5 text-accent-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < t.rating} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">&ldquo;{t.content}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-ink-900">
                    {t.patient_name}
                    {t.location && <span className="font-normal text-slate-500"> — {t.location}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <a
              href="https://maps.app.goo.gl/o2S9KMJLHeYN4aAMA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              Lihat semua ulasan di Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Lokasi */}
      <section id="lokasi" className="scroll-mt-24 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">
            Lokasi Kami
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {SITE.addresses.map((loc) => (
              <div key={loc.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink-900">
                  <PinIcon className="h-5 w-5 text-brand-600" /> {loc.label}
                </h3>
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
                  <a
                    href={waLink(`Halo Mossa, ingin kunjungi kantor ${loc.label}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint-600 hover:underline"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold text-ink-900 md:text-4xl">
            Pertanyaan Umum
          </h2>

          {faqs.length === 0 ? (
            <p className="mt-8 text-center text-slate-400">Belum ada FAQ.</p>
          ) : (
            <div className="mt-10 space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <button
                    onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-ink-900">{f.question}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-brand-600 transition ${openFaq === f.id ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === f.id && (
                    <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{f.answer}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function StarIcon({ filled, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
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
function ChevronDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
