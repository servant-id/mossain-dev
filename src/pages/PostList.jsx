import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { fetchPosts } from "../lib/content";

const LABELS = {
  blog: { title: "Blog", desc: "Tips kesehatan, inovasi prostetik & ortotik, dan kisah inspiratif dari Mossa Orthopedic Care." },
  news: { title: "News", desc: "Kabar terbaru seputar layanan dan kegiatan Mossa Orthopedic Care." },
};

export default function PostList({ type }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const label = LABELS[type];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPosts(type)
      .then((data) => !cancelled && setPosts(data))
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [type]);

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-center font-display text-4xl font-bold text-ink-900">{label.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">{label.desc}</p>

        {loading ? (
          <div className="mt-16 text-center text-slate-400">Memuat…</div>
        ) : posts.length === 0 ? (
          <div className="mt-16 text-center text-slate-400">Belum ada artikel.</div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/${type}/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-floaty"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">Mossa</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                    {formatDate(post.created_at)} · {post.author}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-lg font-bold text-ink-900 transition group-hover:text-brand-700">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
                    {(post.excerpt || post.content || "").slice(0, 150)}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-brand-600">Baca selengkapnya →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
