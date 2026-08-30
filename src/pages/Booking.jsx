import { useState } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjkepjvd";

export default function Booking() {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.target;
    const data = new FormData(form);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <Layout>
      <PageHero title="Booking Konsultasi" breadcrumb="Booking" />

      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-slate-600">
          Sampaikan keluhan atau kebutuhan Anda, dan tim praktisi kami akan menghubungi untuk
          menjadwalkan konsultasi atau kunjungan.
        </p>

        {status === "success" ? (
          <div className="mt-10 rounded-2xl bg-mint-50 p-8 text-center">
            <p className="text-lg font-semibold text-mint-600">Terima kasih! Formulir Anda telah terkirim.</p>
            <p className="mt-2 text-sm text-slate-600">Tim Mossa akan segera menghubungi Anda.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl bg-white p-8 shadow-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Nama Lengkap" name="nama" type="text" required />
              <Field label="E-Mail" name="email" type="email" required />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Nomor WA" name="telepon" type="text" required />
              <div>
                <label htmlFor="layanan" className="mb-2 block text-sm font-medium text-slate-700">Jenis Layanan</label>
                <select
                  id="layanan"
                  name="layanan"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="">Pilih layanan</option>
                  <option value="Prostetik (Kaki/Tangan Palsu)">Prostetik (Kaki/Tangan Palsu)</option>
                  <option value="Ortotik (Brace/Penyangga)">Ortotik (Brace/Penyangga)</option>
                  <option value="Konsultasi Umum">Konsultasi Umum</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="keluhan" className="mb-2 block text-sm font-medium text-slate-700">Keluhan / Kebutuhan</label>
              <textarea
                id="keluhan"
                name="keluhan"
                rows={4}
                required
                placeholder="Ceritakan kondisi atau kebutuhan Anda secara singkat."
                className="w-full rounded-xl border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div>
              <label htmlFor="rencana_visit" className="mb-2 block text-sm font-medium text-slate-700">
                Rencana Kunjungan (opsional)
              </label>
              <input
                id="rencana_visit"
                name="rencana_visit"
                type="text"
                placeholder="Mis. minggu depan, atau lokasi kantor yang dituju"
                className="w-full rounded-xl border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>

            {status === "error" && (
              <p className="text-sm font-medium text-red-600">
                Gagal mengirim formulir. Silakan coba lagi atau hubungi kami via WhatsApp.
              </p>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-full bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-60"
              >
                {status === "submitting" ? "Mengirim…" : "Kirim & Booking Konsultasi"}
              </button>
            </div>
          </form>
        )}
      </section>
    </Layout>
  );
}

function Field({ label, name, type, required }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
