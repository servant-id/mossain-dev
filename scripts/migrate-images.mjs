#!/usr/bin/env node
/**
 * migrate-images.mjs
 * ---------------------------------------------------------------
 * One-time migration: uploads every product photo from the old PHP
 * site's assets/images/<slug>/ folders into Cloudinary, then inserts
 * a matching row into mossain.product_images for each one (via the
 * mossain-admin-write Edge Function, so it goes through the same
 * auth path as the admin UI — no direct service-role use here).
 *
 * Skips the "-min.jpg" compressed duplicates: Cloudinary generates
 * its own responsive/optimized variants on delivery, so we only need
 * to upload the original full-resolution file once per photo.
 *
 * Usage:
 *   1. cp .env.example .env and fill in the values, plus:
 *        CLOUDINARY_CLOUD_NAME=...
 *        CLOUDINARY_API_KEY=...
 *        CLOUDINARY_API_SECRET=...      (signed upload, server-side only)
 *        MOSSAIN_ADMIN_USERNAME=...
 *        MOSSAIN_ADMIN_PASSWORD=...
 *        SOURCE_IMAGES_DIR=/path/to/old-site/assets/images
 *
 *   2. node scripts/migrate-images.mjs
 *
 * Safe to re-run: it skips a slug's images if that product already
 * has rows in product_images (checked before uploading, so you won't
 * get duplicates on a second run).
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  MOSSAIN_ADMIN_USERNAME,
  MOSSAIN_ADMIN_PASSWORD,
  SOURCE_IMAGES_DIR,
} = process.env;

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error("Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env");
  process.exit(1);
}
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Isi kredensial Cloudinary (signed) di .env");
  process.exit(1);
}
if (!SOURCE_IMAGES_DIR || !fs.existsSync(SOURCE_IMAGES_DIR)) {
  console.error("SOURCE_IMAGES_DIR tidak ditemukan:", SOURCE_IMAGES_DIR);
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  db: { schema: "mossain" },
});

const FUNCTIONS_BASE = `${VITE_SUPABASE_URL}/functions/v1`;

async function adminLogin() {
  const res = await fetch(`${FUNCTIONS_BASE}/mossain-admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: MOSSAIN_ADMIN_USERNAME, password: MOSSAIN_ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login admin gagal.");
  return data.token;
}

async function adminWrite(token, entity, action, body) {
  const res = await fetch(`${FUNCTIONS_BASE}/mossain-admin-write`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ entity, action, ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Gagal ${action} ${entity}`);
  return data;
}

function isRealPhoto(filename) {
  // Skip the pre-compressed "-min" duplicates and any non-image files.
  if (/-min\.(jpe?g|png|webp)$/i.test(filename)) return false;
  return /\.(jpe?g|png|webp)$/i.test(filename);
}

async function main() {
  console.log("Login admin…");
  const token = await adminLogin();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, title");
  if (error) throw error;

  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

  const folders = fs
    .readdirSync(SOURCE_IMAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const folder of folders) {
    const slug = folder.name;
    const product = bySlug[slug];
    if (!product) {
      console.log(`⏭  Lewati folder "${slug}" — tidak ada produk dengan slug ini di database.`);
      continue;
    }

    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", product.id);
    if (count > 0) {
      console.log(`⏭  "${slug}" sudah punya ${count} gambar — dilewati (jalankan ulang aman, tidak duplikat).`);
      continue;
    }

    const dir = path.join(SOURCE_IMAGES_DIR, slug);
    const files = fs.readdirSync(dir).filter(isRealPhoto).sort();

    if (files.length === 0) {
      console.log(`⚠️  "${slug}" tidak punya foto asli di folder sumber.`);
      continue;
    }

    console.log(`⬆️  Mengunggah ${files.length} foto untuk "${product.title}" (${slug})…`);

    let sortOrder = 0;
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: `mossain/${slug}`,
          resource_type: "image",
        });

        await adminWrite(token, "product_images", "insert", {
          payload: {
            product_id: product.id,
            cloudinary_public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
            sort_order: sortOrder,
          },
        });

        console.log(`   ✓ ${file}`);
        sortOrder += 1;
      } catch (err) {
        console.error(`   ✗ Gagal mengunggah ${file}:`, err.message);
      }
    }
  }

  console.log("\nSelesai. Cek tabel mossain.product_images untuk verifikasi.");
}

main().catch((err) => {
  console.error("Migrasi gagal:", err);
  process.exit(1);
});
