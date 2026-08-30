import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageHero from "../components/PageHero";
import ProductCard from "../components/ProductCard";
import { fetchProductCategories, fetchImagesForProducts } from "../lib/content";

const FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "prostetik", label: "Prostetik" },
  { id: "ortotik", label: "Ortotik" },
];

export default function ProductCatalog() {
  const [categories, setCategories] = useState([]);
  const [imagesByProduct, setImagesByProduct] = useState({});
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchProductCategories();
        const allIds = cats.flatMap((c) => c.subcategories.flatMap((s) => s.products.map((p) => p.id)));
        const imgs = await fetchImagesForProducts(allIds);
        if (cancelled) return;
        setCategories(cats);
        setImagesByProduct(imgs);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const flatProducts = useMemo(() => {
    const items = [];
    for (const main of categories) {
      if (filter !== "semua" && main.id !== filter) continue;
      for (const sub of main.subcategories) {
        for (const p of sub.products) {
          const imgs = imagesByProduct[p.id] || [];
          items.push({
            slug: p.slug,
            title: p.title,
            desc: p.descs?.[0] || "",
            hasFull: p.has_full,
            img: imgs[0],
            subLabel: sub.title,
          });
        }
      }
    }
    return items;
  }, [categories, imagesByProduct, filter]);

  return (
    <Layout>
      <PageHero title="Galeri Produk" breadcrumb="Produk" />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === f.id
                  ? "bg-brand-600 text-white shadow-lg"
                  : "bg-white text-slate-600 shadow-card hover:text-brand-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Memuat produk…</p>
        ) : flatProducts.length === 0 ? (
          <p className="text-center text-slate-400">Belum ada produk pada kategori ini.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {flatProducts.map((p) => (
              <div key={p.slug}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">{p.subLabel}</p>
                <ProductCard {...p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
