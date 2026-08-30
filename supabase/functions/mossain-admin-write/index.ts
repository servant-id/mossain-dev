// supabase/functions/mossain-admin-write/index.ts
//
// Single gateway for every admin write (create/update/delete on posts,
// products, product_images, settings, videos). The browser never holds
// the service-role key or talks to these tables directly — anon RLS on
// mossain.* only allows SELECT on published/active rows (see schema.sql).
//
// Auth: `Authorization: Bearer <session-token>` from mossain-admin-login.
// We re-check the token + expiry here on every call (not just on login),
// so a revoked/expired token can't keep writing.
//
// Body shape:
//   { entity: "products" | "posts" | "product_images" | "settings" | "videos",
//     action: "insert" | "update" | "delete",
//     id?: number | string,        // required for update/delete
//     payload?: object }           // required for insert/update

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_ENTITIES = new Set([
  "products",
  "posts",
  "product_images",
  "settings",
  "videos",
]);

// Only these keys may ever be written per entity — prevents a caller from
// smuggling in columns like id, created_at, or (for settings) sneaking a
// write into another table's namespace.
const WRITABLE_FIELDS: Record<string, string[]> = {
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
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Tidak ada sesi login." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "mossain" } }
    );

    const { data: session, error: sessErr } = await supabase
      .from("admin_sessions")
      .select("token, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (sessErr) throw sessErr;
    if (!session || new Date(session.expires_at) < new Date()) {
      return json({ error: "Sesi login sudah habis. Silakan login lagi." }, 401);
    }

    const { entity, action, id, payload } = await req.json();

    if (!ALLOWED_ENTITIES.has(entity)) {
      return json({ error: "Entitas tidak dikenal." }, 400);
    }
    if (!["insert", "update", "delete"].includes(action)) {
      return json({ error: "Aksi tidak dikenal." }, 400);
    }

    if (action === "delete") {
      if (id === undefined) return json({ error: "id wajib diisi untuk delete." }, 400);
      const pk = entity === "settings" ? "setting_key" : "id";
      const { error } = await supabase.from(entity).delete().eq(pk, id);
      if (error) throw error;
      return json({ ok: true });
    }

    const allowed = WRITABLE_FIELDS[entity];
    const cleanPayload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (payload && Object.prototype.hasOwnProperty.call(payload, key)) {
        cleanPayload[key] = payload[key];
      }
    }

    if (action === "insert") {
      const { data, error } = await supabase.from(entity).insert(cleanPayload).select().single();
      if (error) throw error;
      return json({ ok: true, data });
    }

    // update
    if (id === undefined) return json({ error: "id wajib diisi untuk update." }, 400);
    const pk = entity === "settings" ? "setting_key" : "id";
    if (entity === "posts") cleanPayload.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from(entity).update(cleanPayload).eq(pk, id).select().single();
    if (error) throw error;
    return json({ ok: true, data });
  } catch (e) {
    console.error(e);
    return json({ error: "Terjadi kesalahan server. Coba lagi nanti." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
