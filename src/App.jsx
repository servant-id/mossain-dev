import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import RequireAdmin from "./components/RequireAdmin";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import PostList from "./pages/PostList";
import PostDetail from "./pages/PostDetail";
import ConsultationForm from "./pages/ConsultationForm";

// Admin pages are only ever needed by the site owner, never by regular
// visitors — lazy-loading them keeps the public bundle small and the
// first paint for patients/customers fast.
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const AdminPostForm = lazy(() => import("./pages/admin/AdminPostForm"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
      Memuat panel admin…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produk/:slug" element={<ProductDetail />} />
          <Route path="/blog" element={<PostList type="blog" />} />
          <Route path="/blog/:slug" element={<PostDetail type="blog" />} />
          <Route path="/news" element={<PostList type="news" />} />
          <Route path="/news/:slug" element={<PostDetail type="news" />} />
          <Route path="/form" element={<ConsultationForm />} />

          <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
          <Route path="/admin/dashboard" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense></RequireAdmin>} />
          <Route path="/admin/products" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense></RequireAdmin>} />
          <Route path="/admin/products/:id" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminProductForm /></Suspense></RequireAdmin>} />
          <Route path="/admin/posts" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminPosts /></Suspense></RequireAdmin>} />
          <Route path="/admin/posts/:id" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminPostForm /></Suspense></RequireAdmin>} />
          <Route path="/admin/settings" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminSettings /></Suspense></RequireAdmin>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-brand-700">Halaman Tidak Ditemukan</h1>
      <a href="/" className="text-brand-600 hover:underline">← Kembali ke Beranda</a>
    </div>
  );
}
