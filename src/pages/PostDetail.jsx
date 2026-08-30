import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { fetchPostBySlug } from "../lib/content";

export default function PostDetail({ type }) {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetchPostBySlug(type, slug)
      .then((p) => {
        if (cancelled) return;
        if (!p) setNotFound(true);
        else setPost(p);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [type, slug]);

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-slate-400">Memuat…</div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-700">Postingan Tidak Ditemukan</h1>
          <Link to={`/${type}`} className="mt-6 inline-block text-brand-600 hover:underline">
            ← Kembali ke {type === "blog" ? "Blog" : "News"}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <nav className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-brand-600">Beranda</Link> <span className="mx-1">/</span>{" "}
          <Link to={`/${type}`} className="hover:text-brand-600">{type === "blog" ? "Blog" : "News"}</Link>
        </nav>

        <h1 className="font-display text-3xl font-bold leading-tight text-ink-900 md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {formatDate(post.created_at)} · {post.author}
        </p>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="mt-8 aspect-video w-full rounded-2xl object-cover shadow-card"
          />
        )}

        {post.video_url && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl bg-black shadow-card">
            <iframe src={post.video_url} title={post.title} loading="lazy" allowFullScreen className="absolute inset-0 h-full w-full" />
          </div>
        )}

        <div
          className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: post.content_html || `<p>${post.content}</p>` }}
        />
      </article>
    </Layout>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
