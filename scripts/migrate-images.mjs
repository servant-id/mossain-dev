#!/usr/bin/env node
/**
 * migrate-images.mjs
 * ---------------------------------------------------------------
 * One-time migration: mengunggah semua foto produk dari folder lama
 * situs PHP (assets/images/<slug>/) ke Cloudinary, lalu insert baris
 * ke mossain.product_images lewat Supabase langsung (login pakai
 * Supabase Auth, tidak ada Edge Function/server tambahan).
 *
 * Melewati file "-min.jpg" (versi kompresi lama) karena Cloudinary
 * menghasilkan varian responsive/optimized sendiri saat delivery.
 *
 * Pemakaian:
 *   1. cp .env.example .env lalu isi juga:
 *        CLOUDINARY_API_KEY=...
 *        CLOUDINARY_API_SECRET=...
 *        MOSSAIN_ADMIN_EMAIL=...        (akun admin Supabase Auth Anda)
 *        MOSSAIN_ADMIN_PASSWORD=...
 *        SOURCE_IMAGES_DIR=/path/ke/situs-lama/assets/images
 *
 *   2. node scripts/migrate-images.mjs
 *
 * Aman dijalankan ulang: produk yang sudah punya gambar dilewati.
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
  MOSSAIN_ADMIN_EMAIL,
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
if (!MOSSAIN_ADMIN_EMAIL || !MOSSAIN_ADMIN_PASSWORD) {
  console.error("Isi MOSSAIN_ADMIN_EMAIL dan MOSSAIN_ADMIN_PASSWORD di .env (akun Supabase Auth admin)");
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

function isRealPhoto(filename) {
  if (/-min\.(jpe?g|png|webp)$/i.test(filename)) return false;
  return /\.(jpe?g|png|webp)$/i.test(filename);
}

async function main() {
  console.log("Login sebagai admin (Supabase Auth)…");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: MOSSAIN_ADMIN_EMAIL,
    password: MOSSAIN_ADMIN_PASSWORD,
  });
  if (authErr) throw new Error(`Login gagal: ${authErr.message}`);
  console.log(`Login berhasil sebagai ${authData.user.email}.\n`);

  const { data: products, error } = await supabase.from("products").select("id, slug, title");
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

        const { error: insertErr } = await supabase.from("product_images").insert({
          product_id: product.id,
          cloudinary_public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          sort_order: sortOrder,
        });
        if (insertErr) throw new Error(insertErr.message);

        console.log(`   ✓ ${file}`);
        sortOrder += 1;
      } catch (err) {
        console.error(`   ✗ Gagal mengunggah ${file}:`, err.message);
      }
    }
  }

  console.log("\nSelesai. Cek tabel mossain.product_images untuk verifikasi.");
  await supabase.auth.signOut();
}

main().catch((err) => {
  console.error("Migrasi gagal:", err);
  process.exit(1);
});
