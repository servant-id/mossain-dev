import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import RequireAdmin from "./components/RequireAdmin";

import Home from "./pages/Home";
import Booking from "./pages/Booking";
import AboutUs from "./pages/AboutUs";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";

// Admin pages are only ever needed by the site owner, never by regular
// visitors — lazy-loading them keeps the public bundle small and the
// first paint for patients/customers fast.
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminFaqs = lazy(() => import("./pages/admin/AdminFaqs"));
const AdminHeroBanners = lazy(() => import("./pages/admin/AdminHeroBanners"));
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
          <Route path="/booking" element={<Booking />} />
          <Route path="/tentang-kami" element={<AboutUs />} />
          <Route path="/produk" element={<ProductCatalog />} />
          <Route path="/produk/:slug" element={<ProductDetail />} />

          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
          <Route path="/admin/dashboard" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense></RequireAdmin>} />
          <Route path="/admin/products" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense></RequireAdmin>} />
          <Route path="/admin/products/:id" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminProductForm /></Suspense></RequireAdmin>} />
          <Route path="/admin/testimonials" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminTestimonials /></Suspense></RequireAdmin>} />
          <Route path="/admin/faqs" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminFaqs /></Suspense></RequireAdmin>} />
          <Route path="/admin/hero-banners" element={<RequireAdmin><Suspense fallback={<AdminFallback />}><AdminHeroBanners /></Suspense></RequireAdmin>} />
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
