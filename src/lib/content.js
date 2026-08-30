import { supabase } from "./supabaseClient";

const MAIN_TITLES = { prostetik: "Prostetik", ortotik: "Ortotik" };
const SUB_TITLES = {
  prostAtas: "Anggota Gerak Atas",
  prostBawah: "Anggota Gerak Bawah",
  ortotikGlobal: "Alat Bantu Koreksi & Penyangga Tubuh",
};

/** Fetch all active products, grouped the same way products_loader.php did. */
export async function fetchProductCategories() {
  const { data, error } = await supabase
    .from("products")
    .select("id, main, sub, slug, title, descs, full_description, price_label, processing_time, sort_order")
    .eq("is_active", true)
    .order("main")
    .order("sub")
    .order("sort_order")
    .order("title");

  if (error) throw error;

  const structure = [
    { id: "prostetik", title: MAIN_TITLES.prostetik, subcategories: [
      { id: "prostAtas", title: SUB_TITLES.prostAtas, products: [] },
      { id: "prostBawah", title: SUB_TITLES.prostBawah, products: [] },
    ]},
    { id: "ortotik", title: MAIN_TITLES.ortotik, subcategories: [
      { id: "ortotikGlobal", title: SUB_TITLES.ortotikGlobal, products: [] },
    ]},
  ];

  for (const row of data || []) {
    const cat = structure.find((c) => c.id === row.main);
    const sub = cat?.subcategories.find((s) => s.id === row.sub);
    if (!sub) continue;
    sub.products.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      descs: Array.isArray(row.descs) ? row.descs : [],
      has_full: !!row.full_description,
    });
  }

  return structure;
}

/** Fetch one product by slug, with its Cloudinary images. */
export async function fetchProductBySlug(slug) {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!product) return null;

  const { data: images } = await supabase
    .from("product_images")
    .select("url, sort_order")
    .eq("product_id", product.id)
    .order("sort_order");

  return { ...product, images: images || [] };
}

/** Fetch images for a set of product slugs (used to build home page sliders). */
export async function fetchImagesForProducts(productIds) {
  if (!productIds.length) return {};
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, url, sort_order")
    .in("product_id", productIds)
    .order("sort_order");

  if (error) throw error;

  const byProduct = {};
  for (const row of data || []) {
    if (!byProduct[row.product_id]) byProduct[row.product_id] = [];
    byProduct[row.product_id].push(row.url);
  }
  return byProduct;
}

export async function fetchPosts(type, { limit } = {}) {
  let query = supabase
    .from("posts")
    .select("id, title, content, excerpt, author, slug, featured_image, created_at")
    .eq("type", type)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchPostBySlug(type, slug) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("type", type)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchSettings() {
  const { data, error } = await supabase.from("settings").select("setting_key, setting_value");
  if (error) throw error;
  const settings = { show_solusi: true, show_layanan: true, show_video: false };
  for (const row of data || []) {
    settings[row.setting_key] = row.setting_value === "1";
  }
  return settings;
}

export async function fetchVideos() {
  const { data, error } = await supabase
    .from("videos")
    .select("title, source, src, poster")
    .order("sort_order");
  if (error) throw error;
  return (data || []).filter((v) => v.src);
}
