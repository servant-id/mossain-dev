# Mossa Orthopedic Care — React + Supabase

Port dari situs PHP/MySQL lama (mossain.com) ke React + Vite, dengan konten &
autentikasi admin di Supabase, dan gambar di Cloudinary. Struktur & urutan
section mengikuti tema referensi Hident; seluruh konten murni Mossa.

## 1. Setup Supabase

1. Buka SQL Editor di project Supabase Anda (boleh project yang sudah dipakai
   client lain — schema ini terisolasi).
2. Jalankan seluruh isi `supabase/schema.sql`. Ini akan:
   - Membuat schema `mossain` terpisah (tidak akan bentrok dengan tabel
     project lain di database yang sama).
   - Membuat tabel `users`, `admin_sessions`, `products`, `product_images`,
     `posts`, `settings`, `videos`.
   - Mengaktifkan Row Level Security: publik hanya bisa **membaca** data yang
     `is_active`/`published`; semua tulis harus lewat Edge Function.
   - Mengisi data awal (10 produk, 1 admin user dengan password hash yang
     sama seperti di database lama).

3. Deploy 3 Edge Function di `supabase/functions/`:
   ```bash
   supabase functions deploy mossain-admin-login
   supabase functions deploy mossain-admin-verify
   supabase functions deploy mossain-admin-write
   ```
   Pastikan environment variable berikut sudah otomatis tersedia di semua
   Edge Function (Supabase mengisi ini secara default):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Setup Cloudinary

1. Buat akun/cloud Cloudinary (gratis cukup untuk awal).
2. Buat **unsigned upload preset** (Settings → Upload → Add upload preset),
   set folder default ke `mossain` agar rapi dan tidak campur dengan project
   lain jika Cloudinary account ini dipakai bersama.
3. Catat `Cloud Name` dan nama preset untuk `.env`.

## 3. Environment Variables

```bash
cp .env.example .env
```
Isi:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
VITE_CLOUDINARY_CLOUD_NAME=xxxx
VITE_CLOUDINARY_UPLOAD_PRESET=mossain_unsigned
```

## 4. Migrasi Gambar Produk Lama → Cloudinary

Situs PHP lama menyimpan foto produk di `assets/images/<slug>/`. Script
`scripts/migrate-images.mjs` mengunggah semua foto asli (bukan versi
`-min.jpg` terkompresi lama) ke Cloudinary dan otomatis mengisi tabel
`product_images` lewat Edge Function admin-write yang sama dengan yang
dipakai panel admin.

```bash
npm install
# lengkapi .env dengan kredensial Cloudinary signed + akun admin, lihat .env.example
node scripts/migrate-images.mjs
```

Aman dijalankan ulang — produk yang sudah punya gambar akan dilewati,
tidak akan duplikat.

## 5. Development

```bash
npm install
npm run dev
```

## 6. Build & Deploy

```bash
npm run build
```
Hasil build statis ada di `dist/` — deploy ke Vercel/Netlify/Cloudflare
Pages seperti aplikasi Vite React pada umumnya. Tidak perlu server PHP lagi.

## 7. Login Admin

URL: `/admin/login`
Username & password sama seperti di sistem lama (`melbuadmin` + password
lama Anda) — hash bcrypt dipindahkan apa adanya ke `mossain.users`.

## 8. Hosting di GitHub Pages + Deploy dari Codespace

Pembagian tugasnya:
- **GitHub Pages** → hosting frontend statis (hasil `npm run build`).
- **GitHub Actions** → otomatis build & deploy setiap kali Anda push ke `main`.
- **Codespace** → hanya dipakai untuk (a) develop, dan (b) menjalankan
  `supabase` CLI sekali untuk deploy 3 Edge Function ke Supabase.
- **Supabase** → tempat sesungguhnya 3 Edge Function itu berjalan 24/7.
  Edge Function **tidak** jalan di GitHub/Codespace — Codespace cuma
  mengirim kodenya ke Supabase lewat CLI, setelah itu Codespace boleh
  dimatikan dan function tetap aktif.

### Langkah dari nol

**A. Buat repo & push kode**
```bash
# di Codespace atau lokal
git init
git add .
git commit -m "Initial commit: port Mossa ke React + Supabase"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

**B. Aktifkan GitHub Pages**
1. Buka repo di GitHub → **Settings → Pages**.
2. Di "Build and deployment", pilih **Source: GitHub Actions** (bukan
   "Deploy from a branch"). Workflow `.github/workflows/deploy.yml` yang
   sudah disiapkan akan otomatis muncul sebagai opsi build.

**C. Isi Secrets untuk build (Settings → Secrets and variables → Actions)**
Tambahkan 4 repository secret ini (nilainya sama seperti isi `.env` lokal):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

Ini **anon key** (public, aman ditaruh di frontend) — bukan service role key.
Service role key hanya boleh ada di environment Edge Function Supabase,
tidak pernah di GitHub Secrets untuk frontend.

**D. Push ke `main` → otomatis deploy**
Setiap `git push` ke branch `main`, tab **Actions** di GitHub akan
menjalankan build lalu deploy ke:
```
https://<username>.github.io/<nama-repo>/
```

**E. Deploy 3 Edge Function dari Codespace (sekali di awal, lalu tiap ada
perubahan)**
```bash
# buka repo ini di Codespace, lalu:
npm install -g supabase
supabase login          # akan membuka link auth, login pakai akun Supabase
supabase link --project-ref <project-ref-anda>   # lihat di Supabase dashboard
supabase functions deploy mossain-admin-login
supabase functions deploy mossain-admin-verify
supabase functions deploy mossain-admin-write
```
Setelah perintah ini selesai, ketiga function langsung aktif di Supabase —
tidak bergantung pada Codespace tetap menyala.

**F. Jalankan schema.sql & migrasi gambar**
Dua langkah ini (SQL Editor Supabase untuk `schema.sql`, dan
`node scripts/migrate-images.mjs` untuk pindah gambar ke Cloudinary) bisa
dijalankan dari Codespace juga — cukup pastikan `.env` di Codespace terisi
(jangan pernah commit file `.env` ini ke git, sudah masuk `.gitignore`).

## Catatan Penting

- **Form konsultasi** (`/form`) tetap mengirim langsung ke Formspree persis
  seperti sistem lama — tidak ada perubahan pada alur backend kontak.
- **GTranslate** menggunakan widget resmi Google (bukan simulasi) — konten
  tetap tersimpan hanya dalam Bahasa Indonesia; Bahasa Inggris dihasilkan
  dari auto-translate saat pengunjung memilih EN.
- Skema `mossain` di database sengaja diisolasi lewat Postgres schema
  terpisah + RLS, sehingga aman berbagi 1 project/database Supabase dengan
  client lain tanpa risiko tabel/nama bentrok.
