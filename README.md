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

Tidak ada tabel `users` custom — admin login memakai Supabase Auth bawaan,
tapi akses tulis dibatasi hanya untuk email yang terdaftar di
`mossain.admins` (lihat penjelasan isolasi di bawah).

1. Di Supabase Dashboard → **Authentication → Users → Add user**.
2. Isi email & password admin Anda, centang **Auto Confirm User** (supaya
   tidak perlu verifikasi email dulu).
3. **Pastikan email yang sama** juga ada di tabel `mossain.admins` — secara
   default `schema.sql` sudah mengisi `admin@mossain.com`. Kalau email admin
   Anda berbeda, jalankan di SQL Editor:
   ```sql
   insert into mossain.admins (email) values ('email-admin-anda@contoh.com')
   on conflict (email) do nothing;
   ```
   Tanpa baris ini, login akan berhasil (Supabase Auth-nya valid) tapi
   semua operasi tulis (tambah/edit/hapus produk, artikel, dsb) akan ditolak
   oleh RLS — ini yang membuat isolasi antar-client aman.

> Kalau nanti butuh admin kedua, cukup `insert` email keduanya ke
> `mossain.admins` — tidak perlu ubah kode maupun RLS policy sama sekali.

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

## 8. Hosting: Repo Dev (GitHub Actions) → Repo Publik (GitHub Pages, custom domain)

Setup Anda memakai 2 repo:
- **Repo dev** (private, berisi source code + workflow) → tempat Anda kerja
  dan push. Berisi `.github/workflows/deploy.yml`.
- **Repo publik** `servant-id/mossain` → HANYA berisi hasil `dist/` (file
  build siap pakai), di-generate otomatis, jangan diedit manual. GitHub
  Pages repo ini yang menyajikan situs ke domain **mossain.servant.biz.id**.
- **Codespace** → opsional, dipakai untuk develop di repo dev.
- **Supabase** → database + auth + RLS, diakses langsung dari browser.
  Tidak ada komponen server tambahan yang perlu di-deploy sama sekali.

### Cara kerja workflow

Setiap `git push` ke branch `main` di **repo dev**:
1. GitHub Actions checkout kode, install dependencies, `npm run build`.
2. Ada **sanity check otomatis**: build akan GAGAL (merah di tab Actions)
   kalau `dist/index.html` ternyata masih merujuk ke `/src/main.jsx` alih-alih
   bundle hasil build — supaya masalah blank page/MIME error tidak pernah
   lolos ke production tanpa Anda sadari.
3. Hasil `dist/` (termasuk `CNAME` dan `404.html` untuk SPA routing) di-push
   ke **repo publik** `servant-id/mossain`, branch `main`, dengan riwayat
   commit di-reset tiap kali (`force_orphan: true`) supaya repo publik tetap
   ringan.
4. GitHub Pages di repo publik menyajikan isi itu ke domain custom.

### Yang perlu diisi di repo DEV (Settings → Secrets and variables → Actions)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `PERSONAL_TOKEN` — GitHub Personal Access Token dengan akses write ke repo
  `servant-id/mossain` (dipakai `peaceiris/actions-gh-pages` untuk push ke
  repo publik).

### Kalau blank/error MIME lagi muncul di production
1. Cek tab **Actions** di repo dev — kalau step "Sanity check" gagal (merah),
   berarti build memang menghasilkan file yang salah; baca log-nya.
2. Kalau Actions sukses hijau tapi situs tetap blank, buka
   `servant-id/mossain` langsung di GitHub, klik `index.html` di root —
   pastikan baris `<script>`-nya berisi `/assets/index-xxxx.js`, BUKAN
   `/src/main.jsx`. Kalau sudah benar di situ tapi browser masih dapat versi
   lama, itu murni cache CDN (Cloudflare/GitHub Pages) yang belum ter-purge
   — coba tunggu beberapa menit atau purge cache lagi, incognito window
   untuk memastikan bukan cache browser lokal.

## Isolasi Schema & Isolasi Admin (Multi-Project dalam 1 Database)

Kalau Supabase project ini juga dipakai untuk client/project lain (misalnya
servant-main yang menyimpan tabelnya di schema `public`), datanya aman dari
dua sisi:

**1. Isolasi data** — semua tabel Mossa hidup di schema **`mossain`**, bukan
`public`. Nama tabelnya (`mossain.products`, `mossain.posts`, dst) sama
sekali berbeda "alamat" dari `public.products` milik project lain.

**2. Isolasi akses tulis** — ini bagian yang krusial. Karena admin login
sama-sama pakai `auth.users` **bawaan** Supabase (dipakai bersama oleh
*semua* client di project Supabase yang sama), RLS `mossain.*` **tidak**
cukup hanya cek "authenticated" — itu akan membuat admin servant-main (atau
client lain mana pun yang login di project ini) otomatis bisa mengedit
konten Mossa juga, dan sebaliknya.

Solusinya: RLS `mossain.*` memakai fungsi `mossain.is_mossain_admin()` yang
mengecek apakah email yang sedang login ada di tabel `mossain.admins`.
Admin servant-main yang login dengan emailnya sendiri (tidak terdaftar di
`mossain.admins`) akan **ditolak** oleh RLS saat mencoba menulis ke tabel
`mossain.*` manapun — begitu juga sebaliknya, admin Mossa tidak otomatis
punya akses ke tabel `public.*` milik servant-main karena RLS project itu
independen dan tidak mengenal `mossain.admins`.

Tabel `mossain.admins` sendiri tertutup total dari luar (tidak ada policy
select untuk anon/authenticated) — hanya bisa dibaca lewat fungsi
`security definer` di atas atau dari SQL Editor (koneksi service_role).

## Catatan Penting

- **Struktur menu**: Home, Booking (form konsultasi/keluhan — pengganti
  `/form` lama), Tentang Kami (dropdown: Profil, Testimoni, Lokasi, FAQ),
  Produk (galeri katalog). Blog/News dihapus dari struktur ini.
- **Booking** (`/booking`) tetap mengirim langsung ke Formspree persis
  seperti alur `/form` yang lama — tidak ada perubahan pada backend kontak.
- **Testimoni & FAQ** diinput manual lewat admin (`/admin/testimonials`,
  `/admin/faqs`) — bukan hasil scrape/API Google Maps, karena ToS Google
  melarang menyimpan review lebih dari 30 hari tanpa re-sync berkala.
  Halaman Tentang Kami tetap menautkan ke ulasan asli di Google Maps.
- **GTranslate** menggunakan widget resmi Google (bukan simulasi) — konten
  tetap tersimpan hanya dalam Bahasa Indonesia; Bahasa Inggris dihasilkan
  dari auto-translate saat pengunjung memilih EN.
