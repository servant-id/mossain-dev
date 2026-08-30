import { Link } from "react-router-dom";

/**
 * Hero judul halaman untuk halaman selain Home — meniru gaya referensi
 * Hident ("About Us" besar + breadcrumb "Home // About Us" di bawahnya),
 * dengan latar gradient brand alih-alih foto generik.
 */
export default function PageHero({ title, breadcrumb }) {
  return (
    <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-4 py-16 text-white md:py-20">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 text-sm font-medium text-white/80">
          <Link to="/" className="hover:text-white">Home</Link>
          <span className="mx-2">//</span>
          <span className="text-white">{breadcrumb || title}</span>
        </p>
      </div>
    </section>
  );
}
