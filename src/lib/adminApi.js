// Admin auth — Supabase Auth (email + password), langsung dari browser.
// Tidak ada Edge Function, tidak ada server custom. Supabase menangani
// sesi login sendiri (disimpan otomatis oleh @supabase/supabase-js di
// localStorage) dan RLS ("authenticated full access ...") yang
// mengizinkan/menolak setiap query berdasarkan sesi itu.

import { supabase } from "./supabaseClient";

export async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(terjemahkanErrorLogin(error.message));
  return data;
}

export async function adminLogout() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function terjemahkanErrorLogin(msg) {
  if (/invalid login credentials/i.test(msg)) return "Email atau password salah.";
  if (/email not confirmed/i.test(msg)) return "Email belum dikonfirmasi. Cek inbox Anda.";
  return msg;
}

// Kolom mana yang boleh ditulis per entity — mencegah field seperti id atau
// created_at ikut terkirim tanpa sengaja dari form. RLS ("authenticated
// full access ...") di schema.sql yang jadi penjaga keamanan sesungguhnya;
// daftar ini murni untuk kebersihan payload di sisi client.
const WRITABLE_FIELDS = {
  products: [
    "main", "sub", "slug", "title", "descs", "full_description",
    "price_label", "processing_time", "meta_description", "sort_order", "is_active",
  ],
  posts: [
    "title", "content", "excerpt", "content_html", "author", "type", "status",
    "featured_image", "video_url", "slug", "meta_title", "meta_description",
    "meta_keywords", "canonical_url", "og_image",
  ],
  product_images: ["product_id", "cloudinary_public_id", "url", "sort_order"],
  settings: ["setting_value"],
  videos: ["title", "source", "src", "poster", "sort_order"],
  testimonials: ["patient_name", "location", "rating", "content", "status", "sort_order"],
  faqs: ["question", "answer", "status", "sort_order"],
  hero_banners: ["image_url", "eyebrow", "title", "description", "cta_text", "cta_url", "status", "sort_order"],
};

/**
 * Pengganti drop-in untuk pemanggilan lama `adminWrite({ entity, action, id, payload })`.
 * Sebelumnya ini fetch ke Edge Function; sekarang langsung query ke
 * Supabase dari browser (aman karena dilindungi RLS "authenticated").
 * Signature/return value sengaja dibuat identik supaya halaman-halaman
 * admin yang sudah memanggilnya tidak perlu diubah.
 */
export async function adminWrite({ entity, action, id, payload }) {
  const allowed = WRITABLE_FIELDS[entity];
  if (!allowed) throw new Error(`Entitas tidak dikenal: ${entity}`);

  const pk = entity === "settings" ? "setting_key" : "id";

  if (action === "delete") {
    if (id === undefined) throw new Error("id wajib diisi untuk delete.");
    const { error } = await supabase.from(entity).delete().eq(pk, id);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  const cleanPayload = {};
  for (const key of allowed) {
    if (payload && Object.prototype.hasOwnProperty.call(payload, key)) {
      cleanPayload[key] = payload[key];
    }
  }

  if (action === "insert") {
    const { data, error } = await supabase.from(entity).insert(cleanPayload).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, data };
  }

  if (action === "update") {
    if (id === undefined) throw new Error("id wajib diisi untuk update.");
    if (entity === "posts") cleanPayload.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from(entity).update(cleanPayload).eq(pk, id).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, data };
  }

  throw new Error(`Aksi tidak dikenal: ${action}`);
}
