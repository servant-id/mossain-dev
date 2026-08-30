# Mossa Orthopedic Care — React + Supabase

Port dari situs PHP/MySQL lama (mossain.com) ke React + Vite, dengan konten &
autentikasi admin di Supabase (Supabase Auth — bukan server custom), dan
gambar di Cloudinary. Struktur & urutan section mengikuti tema referensi
Hident; seluruh konten murni Mossa.

**Tidak butuh VPS atau Edge Function apa pun.** Semua CRUD admin jalan
langsung dari browser ke Supabase, dilindungi Row Level Security bawaan
Postgres — cocok untuk hosting statis seperti GitHub Pages.

## 1. Setup Supabase

1. Buka SQL Editor di project Supabase Anda (boleh project yang sudah
   dipakai client lain, misalnya schema `public` untuk project lain — schema
   `mossain` ini terisolasi penuh, lihat bagian "Isolasi Schema" di bawah).
2. **Sebelum menjalankan schema**, cek dulu tidak ada nama bentrok:
   ```sql
   SELECT schema_name FROM information_schema.schemata;
   ```
   Kalau `mossain` belum ada di daftar → aman dijalankan.
3. Jalankan seluruh isi `supabase/schema.sql`. Ini akan:
   - Membuat schema `mossain` terpisah dari `public` (project lain di
     database yang sama, misalnya yang pakai tabel `products`/`orders` di
     `public`, tidak akan tersentuh sama sekali).
   - Membuat tabel `products`, `product_images`, `posts`, `settings`, `videos`.
   - Mengaktifkan Row Level Security:
     - **Publik (pengunjung situs)**: hanya boleh **membaca** data yang
       `is_active`/`published`.
     - **Authenticated (siapa pun yang berhasil login)**: boleh CRUD penuh.
   - Mengisi data awal (10 produk).

## 2. Buat Akun Admin (Supabase Auth)

Tidak ada tabel `users` custom — admin login memakai Supabase Auth bawaan.

1. Di Supabase Dashboard → **Authentication → Users → Add user**.
2. Isi email & password admin Anda, centang **Auto Confirm User** (supaya
   tidak perlu verifikasi email dulu).
3. Selesai — email & password ini yang dipakai login di `/admin/login`.

> Catatan: siapa pun yang berhasil login (punya akun di Authentication →
> Users) otomatis punya akses admin penuh ke seluruh konten Mossa, karena
> policy RLS-nya `auth.role() = 'authenticated'`. Jangan buat user tambahan
> di project Supabase ini kecuali memang untuk admin Mossa juga.

## 3. Setup Cloudinary

1. Buat akun/cloud Cloudinary (gratis cukup untuk awal).
2. Buat **unsigned upload preset** (Settings → Upload → Add upload preset),
   set folder default ke `mossain` agar rapi dan tidak campur dengan project
   lain jika Cloudinary account ini dipakai bersama.
3. Catat `Cloud Name` dan nama preset untuk `.env`.

## 4. Environment Variables

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
`VITE_SUPABASE_ANON_KEY` adalah **anon/public key** (bukan service role) —
aman ditaruh di kode frontend karena keamanannya dijamin oleh RLS, bukan
oleh kerahasiaan key ini.

## 5. Migrasi Gambar Produk Lama → Cloudinary

Situs PHP lama menyimpan foto produk di `assets/images/<slug>/`. Script
`scripts/migrate-images.mjs` mengunggah semua foto asli (bukan versi
`-min.jpg` terkompresi lama) ke Cloudinary dan otomatis mengisi tabel
`product_images` — login pakai akun admin Supabase Auth yang sudah dibuat
di langkah 2.

```bash
npm install
# lengkapi .env dengan kredensial Cloudinary + MOSSAIN_ADMIN_EMAIL/PASSWORD
node scripts/migrate-images.mjs
```

Aman dijalankan ulang — produk yang sudah punya gambar akan dilewati,
tidak akan duplikat.

## 6. Development

```bash
npm install
npm run dev
```

## 7. Build & Deploy Manual (opsional, di luar GitHub Pages)

```bash
npm run build
```
Hasil build statis ada di `dist/` — bisa di-deploy ke hosting statis mana
pun (Vercel/Netlify/Cloudflare Pages), atau lanjut ke bagian 8 untuk GitHub
Pages.

## 8. Hosting di GitHub Pages + Deploy dari Codespace

Pembagian tugasnya sekarang jauh lebih simpel karena tidak ada Edge
Function:
- **GitHub Pages** → hosting frontend statis (hasil `npm run build`).
- **GitHub Actions** → otomatis build & deploy setiap kali Anda push ke `main`.
- **Codespace** → hanya dipakai untuk develop (opsional — bisa juga langsung
  push dari lokal).
- **Supabase** → database + auth + RLS, diakses langsung dari browser.
  Tidak ada komponen server tambahan yang perlu di-deploy sama sekali.

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
2. Di "Build and deployment", pilih **Source: GitHub Actions**. Workflow
   `.github/workflows/deploy.yml` yang sudah disiapkan akan otomatis muncul
   sebagai opsi build.

**C. Isi Secrets untuk build (Settings → Secrets and variables → Actions)**
Tambahkan 4 repository secret ini (nilainya sama seperti isi `.env` lokal):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

**D. Push ke `main` → otomatis deploy**
Setiap `git push` ke branch `main`, tab **Actions** di GitHub akan
menjalankan build lalu deploy ke:
```
https://<username>.github.io/<nama-repo>/
```

Tidak ada langkah E/F seperti sebelumnya (deploy Edge Function) — cukup
sampai di sini. Login admin langsung berfungsi begitu langkah 1–2 di atas
selesai, karena admin login bicara langsung ke Supabase Auth dari browser.

## Isolasi Schema (Multi-Project dalam 1 Database)

Kalau Supabase project ini juga dipakai untuk client/project lain (misalnya
yang menyimpan tabelnya di schema `public` dengan kolom pembeda seperti
`project_name`), tidak akan ada bentrok karena:
- Semua tabel Mossa hidup di schema **`mossain`**, bukan `public`.
- Nama tabelnya (`mossain.products`, `mossain.posts`, dst) sama sekali
  berbeda "alamat" dari `public.products` milik project lain.
- RLS masing-masing schema independen satu sama lain.

Satu hal yang perlu diperhatikan: karena admin auth sekarang pakai Supabase
Auth **bawaan project** (bukan tabel custom), tabel `auth.users` dipakai
bersama oleh **semua** project/client di Supabase project yang sama. Kalau
Anda taruh admin Mossa dan admin project lain di satu Supabase project yang
sama, keduanya akan muncul di daftar Authentication → Users yang sama —
tapi karena RLS di schema `mossain` mengizinkan *siapa pun yang
authenticated*, admin project lain juga otomatis bisa mengedit konten
Mossa (dan sebaliknya, tergantung RLS project itu). Kalau ini tidak
diinginkan, pertimbangkan pakai Supabase project terpisah untuk tiap
client, atau tambahkan pengecekan email spesifik di RLS policy (misal
`auth.jwt() ->> 'email' = 'admin@mossain.com'`).

## Catatan Penting

- **Form konsultasi** (`/form`) tetap mengirim langsung ke Formspree persis
  seperti sistem lama — tidak ada perubahan pada alur backend kontak.
- **GTranslate** menggunakan widget resmi Google (bukan simulasi) — konten
  tetap tersimpan hanya dalam Bahasa Indonesia; Bahasa Inggris dihasilkan
  dari auto-translate saat pengunjung memilih EN.
