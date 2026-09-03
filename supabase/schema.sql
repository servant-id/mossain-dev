-- =========================================================
-- Mossa Orthopedic Care (mossain.com) — Supabase schema
-- Namespaced in its own Postgres schema `mossain` so this
-- client's tables never collide with any other project living
-- in the same shared Supabase database/project (e.g. servant-main
-- in `public`).
--
-- Auth: Supabase Auth (email+password). No Edge Functions needed
-- anywhere — every admin write goes straight from the browser to
-- Supabase.
--
-- IMPORTANT — multi-client isolation: RLS write access here is
-- scoped to the specific admin email(s) listed in mossain.admins,
-- NOT to "any authenticated user". If this Supabase project is
-- shared with other clients (e.g. servant-main), their admins
-- being logged in does NOT grant them access to Mossa's data, and
-- vice versa. See mossain.admins below.
-- =========================================================

create schema if not exists mossain;

-- Lets the anon/authenticated API roles see this schema at all.
-- (Supabase's PostgREST only exposes schemas you explicitly grant.)
grant usage on schema mossain to anon, authenticated;

-- ---------------------------------------------------------
-- products
-- ---------------------------------------------------------
create table if not exists mossain.products (
  id                bigint generated always as identity primary key,
  main              text not null check (main in ('prostetik','ortotik')),
  sub               text not null check (sub in ('prostAtas','prostBawah','ortotikGlobal')),
  slug              varchar(80) not null unique,
  title             varchar(255) not null,
  descs             jsonb not null default '[]'::jsonb,
  full_description  text,
  price_label       varchar(200),
  processing_time   varchar(100),
  meta_description  varchar(160),
  sort_order        int default 0,
  is_active         boolean default true,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------
-- product_images — Cloudinary asset references
-- ---------------------------------------------------------
create table if not exists mossain.product_images (
  id               bigint generated always as identity primary key,
  product_id       bigint not null references mossain.products(id) on delete cascade,
  cloudinary_public_id text not null,
  url              text not null,
  sort_order       int default 0,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------
-- posts (blog & news)
-- ---------------------------------------------------------
create table if not exists mossain.posts (
  id                bigint generated always as identity primary key,
  title             varchar(255) not null,
  content           text not null,
  excerpt           text,
  content_html      text,
  author            varchar(100) not null default 'Mossa Admin',
  type              text not null check (type in ('news','blog')),
  status            text not null default 'published' check (status in ('draft','published')),
  featured_image    text,
  video_url         varchar(255),
  slug              varchar(255) not null unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  meta_title        varchar(70),
  meta_description  varchar(160),
  meta_keywords     varchar(255),
  canonical_url     varchar(255),
  og_image          text
);

-- ---------------------------------------------------------
-- settings (site-wide toggles)
-- ---------------------------------------------------------
create table if not exists mossain.settings (
  setting_key   varchar(50) primary key,
  setting_value text not null
);

insert into mossain.settings (setting_key, setting_value) values
  ('show_layanan', '1')
on conflict (setting_key) do nothing;

-- ---------------------------------------------------------
-- videos
-- ---------------------------------------------------------
create table if not exists mossain.videos (
  id         bigint generated always as identity primary key,
  title      varchar(255),
  source     text default 'link',
  src        text,
  poster     text,
  sort_order int default 0
);

-- ---------------------------------------------------------
-- testimonials — diinput manual lewat admin (bukan scrape/API
-- Google Maps, karena ToS Google melarang cache review >30 hari).
-- ---------------------------------------------------------
create table if not exists mossain.testimonials (
  id           bigint generated always as identity primary key,
  patient_name varchar(150) not null,
  location     varchar(150),
  rating       smallint not null default 5 check (rating between 1 and 5),
  content      text not null,
  status       text not null default 'published' check (status in ('draft','published')),
  sort_order   int default 0,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------
-- faqs — pertanyaan umum, ditampilkan di halaman Tentang Kami
-- ---------------------------------------------------------
create table if not exists mossain.faqs (
  id         bigint generated always as identity primary key,
  question   text not null,
  answer     text not null,
  status     text not null default 'published' check (status in ('draft','published')),
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- hero_banners — slide-slide di hero Home (bisa geser/swipe).
-- Diisi manual lewat admin, biasanya satu banner "perwakilan"
-- per kategori produk (mis. satu foto prostetik, satu ortotik,
-- satu brace) — bukan menampilkan seluruh katalog di hero.
-- ---------------------------------------------------------
create table if not exists mossain.hero_banners (
  id          bigint generated always as identity primary key,
  image_url   text not null,
  eyebrow     varchar(120),
  title       varchar(200) not null,
  description text,
  cta_text    varchar(60),
  cta_url     text,
  status      text not null default 'published' check (status in ('draft','published')),
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- Daftar admin yang diizinkan
--
-- KRUSIAL untuk isolasi multi-client: kalau project Supabase ini
-- dipakai bersama client lain (mis. servant-main), "authenticated"
-- saja TIDAK CUKUP sebagai syarat — itu berarti siapa pun yang
-- berhasil login di project ini (termasuk admin client lain) akan
-- bisa mengedit data Mossa juga. Tabel ini + fungsi di bawah
-- membatasi akses tulis hanya untuk email yang terdaftar di sini.
--
-- Tambah/kurangi admin Mossa cukup lewat INSERT/DELETE di tabel
-- ini — tidak perlu mengubah policy RLS sama sekali.
-- =========================================================
create table if not exists mossain.admins (
  email text primary key
);

-- Isi email admin Mossa di sini (boleh lebih dari satu baris kalau
-- ada beberapa admin). GANTI dengan email asli yang Anda daftarkan
-- di Authentication > Users.
insert into mossain.admins (email) values
  ('admin@mossain.com')
on conflict (email) do nothing;

-- security definer: fungsi ini boleh membaca mossain.admins meskipun
-- RLS tabel admins sendiri menutup akses langsung (lihat di bawah),
-- supaya policy pada tabel lain bisa memanggilnya tanpa perlu
-- membuka akses baca ke seluruh isi tabel admins.
create or replace function mossain.is_mossain_admin()
returns boolean
language sql
security definer
set search_path = mossain, pg_temp
as $$
  select exists (
    select 1 from mossain.admins
    where email = auth.jwt() ->> 'email'
  );
$$;

-- =========================================================
-- Row Level Security
--
-- Public (anon): read-only pada konten published/active.
-- Admin Mossa (authenticated DAN emailnya ada di mossain.admins):
--   full CRUD. Authenticated saja (mis. admin client lain di project
--   Supabase yang sama) TIDAK dapat akses tulis maupun baca draft.
-- =========================================================
alter table mossain.products enable row level security;
alter table mossain.product_images enable row level security;
alter table mossain.posts enable row level security;
alter table mossain.settings enable row level security;
alter table mossain.videos enable row level security;
alter table mossain.testimonials enable row level security;
alter table mossain.faqs enable row level security;
alter table mossain.hero_banners enable row level security;
alter table mossain.admins enable row level security;
-- Tidak ada policy sama sekali untuk mossain.admins -> tertutup total
-- dari anon maupun authenticated biasa; hanya fungsi security definer
-- di atas dan koneksi service_role yang bisa membacanya.

-- --- Public read ---
create policy "public read active products" on mossain.products
  for select using (is_active = true);

create policy "public read product images" on mossain.product_images
  for select using (
    exists (select 1 from mossain.products p where p.id = product_id and p.is_active = true)
  );

create policy "public read published posts" on mossain.posts
  for select using (status = 'published');

create policy "public read settings" on mossain.settings
  for select using (true);

create policy "public read videos" on mossain.videos
  for select using (true);

create policy "public read published testimonials" on mossain.testimonials
  for select using (status = 'published');

create policy "public read published faqs" on mossain.faqs
  for select using (status = 'published');

create policy "public read published hero banners" on mossain.hero_banners
  for select using (status = 'published');

-- --- Admin Mossa saja (bukan sembarang authenticated) ---
create policy "mossain admin full access products" on mossain.products
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access product_images" on mossain.product_images
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access posts" on mossain.posts
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access testimonials" on mossain.testimonials
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access faqs" on mossain.faqs
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access hero banners" on mossain.hero_banners
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access settings" on mossain.settings
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

create policy "mossain admin full access videos" on mossain.videos
  for all using (mossain.is_mossain_admin()) with check (mossain.is_mossain_admin());

-- Grants: RLS policies di atas menentukan *baris mana*, tapi PostgREST
-- tetap butuh hak akses level-tabel supaya operasinya diizinkan sama
-- sekali. Authenticated tetap diberi grant di level tabel karena RLS
-- policy di atas (mossain.is_mossain_admin()) yang jadi penjaga
-- sesungguhnya siapa yang benar-benar bisa menulis.
grant select on all tables in schema mossain to anon;
grant select, insert, update, delete on all tables in schema mossain to authenticated;
grant usage, select on all sequences in schema mossain to authenticated;
revoke all on mossain.admins from anon, authenticated;

-- =========================================================
-- Seed data (mirrors the current PHP/MySQL content 1:1)
-- =========================================================
insert into mossain.products (main, sub, slug, title, descs, price_label, processing_time, sort_order) values
('prostetik','prostAtas','tangan-atas-siku','Tangan Palsu Atas Siku',
 '["Dirancang untuk kontrol maksimal dengan memanfaatkan gerakan bahu, memungkinkan pengguna untuk membuka dan menutup tangan buatan secara intuitif.","Sistem rongga (soket) yang dibuat pas sesuai ukuran lengan menjamin kenyamanan dan mencegah iritasi saat dipakai beraktivitas.","Menggunakan material komposit yang ringan namun sangat kuat, sehingga tidak membebani pengguna saat bergerak.","Sistem suspensi modern memastikan tangan palsu terpasang dengan aman tanpa mudah terlepas.","Tersedia pilihan dengan penampilan yang sangat mirip tangan asli, membantu mengembalikan rasa percaya diri."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 10),
('prostetik','prostAtas','tangan-bawah-siku','Tangan Palsu Bawah Siku',
 '["Memanfaatkan kekuatan rotasi alami dari sisa lengan untuk menghasilkan gerakan pergelangan yang lebih natural dan fungsional.","Soket dibuat secara custom mengikuti kontur lengan untuk kenyamanan maksimal dan distribusi tekanan yang merata.","Menawarkan berbagai pilihan alat genggam yang dapat disesuaikan untuk aktivitas spesifik, seperti memegang sendok atau menulis.","Dibuat dari bahan yang ringan sehingga terasa nyaman dan tidak melelahkan untuk penggunaan sepanjang hari.","Secara signifikan membantu pengguna untuk kembali melakukan aktivitas sehari-hari secara mandiri."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 20),
('prostetik','prostAtas','jari-palsu','Jari Palsu',
 '["Dibuat dengan detail sangat tinggi dari bahan silikon medis, dengan warna dan tekstur yang disesuaikan agar sama persis dengan kulit asli.","Setiap detail seperti kuku, kerutan kulit, dan warna dibuat secara teliti untuk penampilan yang sangat alami.","Berfungsi untuk mengembalikan penampilan tangan secara utuh, yang sangat penting untuk interaksi sosial dan kepercayaan diri.","Pemasangannya mudah dan aman, menyatu dengan baik pada sisa jari tanpa memerlukan prosedur bedah.","Bahan silikon yang digunakan bersifat hipoalergenik, sehingga aman untuk kulit dan nyaman digunakan."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 30),
('prostetik','prostBawah','kaki-atas-lutut','Kaki Palsu Atas Lutut',
 '["Dilengkapi komponen sendi lutut buatan yang canggih untuk membantu menciptakan pola berjalan yang stabil dan aman.","Sendi lutut ini dapat beradaptasi dengan berbagai kecepatan langkah, dari berjalan santai hingga lebih cepat.","Sistem suspensi vakum atau pin memastikan kaki palsu terpasang dengan kencang, memberikan rasa aman saat berdiri dan bergerak.","Dirancang untuk memberikan keseimbangan sempurna antara kekuatan, bobot ringan, dan penampilan yang natural.","Soket yang dibuat custom memastikan kenyamanan pada area pangkal paha, bahkan saat digunakan dalam waktu lama."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 10),
('prostetik','prostBawah','kaki-bawah-lutut','Kaki Palsu Bawah Lutut',
 '["Soket yang dibuat khusus dengan lapisan dalam dari silikon empuk memeluk tungkai dengan pas untuk mencegah lecet.","Menggunakan teknologi telapak kaki buatan yang dapat menyimpan dan melepaskan energi, membuat setiap langkah terasa lebih ringan.","Sangat ideal untuk pengguna yang aktif, karena memberikan stabilitas dan fleksibilitas untuk bergerak lebih bebas.","Desainnya yang modern memungkinkan pengguna untuk mendapatkan kembali pola berjalan yang simetris dan alami.","Material yang ringan mengurangi energi yang dibutuhkan untuk berjalan, sehingga pengguna tidak mudah lelah."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 20),
('prostetik','prostBawah','telapak-palsu','Telapak Kaki Palsu (Prostesis Syme)',
 '["Dirancang secara spesifik untuk level amputasi di area pergelangan kaki (amputasi Syme).","Memungkinkan pengguna untuk menumpu berat badan pada ujung tungkai, memberikan sensasi pijakan yang lebih baik.","Memberikan fondasi yang sangat stabil dan kokoh untuk berdiri maupun berjalan di berbagai jenis permukaan.","Desainnya yang ramping dan ringkas memungkinkan penggunaan dengan sebagian besar model sepatu standar.","Fokus utama dari desain ini adalah fungsionalitas dan kenyamanan untuk mobilitas sehari-hari."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 30),
('prostetik','prostBawah','jari-kaki-palsu','Jari Kaki Palsu',
 '["Dibuat dari silikon medis dengan warna dan tekstur yang disesuaikan agar menyerupai kulit dan kuku kaki asli.","Dicetak custom mengikuti ukuran dan bentuk jari kaki Anda sehingga nyaman dipakai, termasuk di dalam sepatu atau sandal.","Membantu menutupi kehilangan parsial/total pada jari kaki untuk penampilan yang lebih natural dan meningkatkan kepercayaan diri.","Permukaan halus dan mudah dibersihkan; bahan hipoalergenik aman untuk kulit dan nyaman dipakai sepanjang hari.","Bisa dipadukan dengan insole/orthotic bila diperlukan untuk menambah kenyamanan dan stabilitas saat berjalan."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 40),
('ortotik','ortotikGlobal','mso-brace-scoliosis','MSO Brace (Koreksi Skoliosis)',
 '["Dibuat khusus dari hasil cetakan tubuh pasien untuk memberikan tekanan lembut yang sangat efektif dan terarah.","Bertujuan untuk menahan laju kelengkungan dan membantu mengoreksi postur tulang belakang sesuai anjuran dokter.","Desainnya yang ringan dan memiliki sirkulasi udara yang baik membuatnya nyaman dipakai dalam waktu lama, bahkan di bawah pakaian.","Sistem pengencang yang mudah disesuaikan memungkinkan penyesuaian seiring dengan perkembangan terapi.","Merupakan alat bantu non-bedah yang terbukti efektif untuk manajemen skoliosis pada masa pertumbuhan."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 10),
('ortotik','ortotikGlobal','dennis-splint-ctev','Dennis Splint (Kaki Anak CTEV)',
 '["Dennis Brown Splint (DBS) adalah alat bantu ortopedi (ortosis) yang dirancang khusus untuk mengoreksi dan mempertahankan posisi kaki bayi yang mengalami kelainan bawaan seperti Congenital Talipes Equinovarus (CTEV/clubfoot).","Alat ini sangat penting untuk menjaga agar kaki bayi dengan kondisi CTEV (clubfoot) tidak kembali bengkok setelah terapi.","Terdiri dari sepasang sepatu khusus yang terhubung dengan sebuah bar untuk mempertahankan posisi kaki yang sudah dikoreksi.","Dirancang agar nyaman dan aman digunakan oleh bayi saat tidur, yang merupakan waktu pemakaian utamanya.","Menjadi bagian krusial dari keberhasilan metode Ponseti, sebuah standar emas dalam penanganan clubfoot.","Penggunaannya secara rutin sesuai anjuran dokter dapat mencegah kambuhnya kondisi dan menghindari prosedur bedah."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 20),
('ortotik','ortotikGlobal','ortosis-afo-anak','Penyangga Kaki Anak (AFO)',
 '["Berfungsi untuk menstabilkan sendi pergelangan kaki dan telapak kaki pada anak dengan kondisi \"lemah\" atau \"jatuh\" (drop foot).","Membantu menciptakan pola berjalan yang lebih normal dan seimbang, sehingga mengurangi risiko anak tersandung atau jatuh.","Dibuat dari bahan plastik yang ringan namun kuat, sehingga tidak mengganggu aktivitas bermain anak.","Bisa dibuat dengan berbagai model dan warna yang menarik agar anak lebih senang memakainya setiap hari.","Secara aktif membantu mengoreksi posisi telapak kaki dan mencegah deformitas lebih lanjut seiring pertumbuhan anak."]'::jsonb,
 'Hubungi kami untuk informasi harga', '7–21 hari kerja', 30)
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- Seed FAQ awal (bisa diedit/ditambah lewat admin nantinya)
-- ---------------------------------------------------------
insert into mossain.faqs (question, answer, sort_order) values
('Apakah Mossa melayani konsultasi sebelum pembuatan alat?',
 'Ya. Setiap pasien akan melalui sesi konsultasi dan asesmen langsung dengan praktisi kami untuk menentukan jenis alat yang paling sesuai dengan kondisi dan kebutuhan Anda.',
 10),
('Berapa lama proses pembuatan prostetik atau ortotik?',
 'Secara umum proses pengerjaan membutuhkan waktu 7–21 hari kerja, tergantung jenis dan tingkat kerumitan alat. Estimasi pasti akan disampaikan saat konsultasi.',
 20),
('Apakah Mossa melayani pasien di luar Sidoarjo dan Jember?',
 'Kami memiliki kantor di Sidoarjo dan Jember, namun tetap terbuka melayani pasien dari kota lain. Silakan hubungi kami via WhatsApp untuk mendiskusikan opsi kunjungan atau pengiriman.',
 30),
('Apakah hasil pemeriksaan medis (rekam medis) wajib dilampirkan?',
 'Tidak wajib, namun sangat dianjurkan. Rekam medis atau hasil pemeriksaan dokter membantu praktisi kami merancang alat yang lebih presisi sesuai kondisi Anda.',
 40),
('Apakah alat yang dibuat bisa disesuaikan lagi setelah selesai?',
 'Bisa. Kami menyediakan sesi penyesuaian (fitting) setelah alat selesai dibuat untuk memastikan kenyamanan dan fungsi yang optimal bagi pasien.',
 50)
on conflict do nothing;

-- ---------------------------------------------------------
-- Seed hero banner awal — 1 gambar placeholder per kategori.
-- Admin bisa ganti image_url lewat /admin/hero-banners setelah
-- gambar produk asli sudah dipindah ke Cloudinary.
-- ---------------------------------------------------------
insert into mossain.hero_banners (image_url, eyebrow, title, description, cta_text, cta_url, sort_order) values
('/hero-prosthetic.jpg', 'Prostetik', 'Kaki & Tangan Palsu Custom Fit',
 'Dibuat mengikuti anatomi pasien untuk kenyamanan dan mobilitas maksimal.',
 'Lihat Produk Prostetik', '/produk', 10),
('/hero-prosthetic.jpg', 'Ortotik', 'Penyangga & Koreksi Postur Tubuh',
 'Solusi ortotik untuk mendukung pemulihan dan aktivitas sehari-hari.',
 'Lihat Produk Ortotik', '/produk', 20),
('/hero-prosthetic.jpg', 'Brace & Alat Bantu', 'MSO Brace, Dennis Splint, AFO Anak',
 'Alat bantu penunjang tumbuh kembang, ditangani praktisi yang telaten.',
 'Lihat Semua Produk', '/produk', 30)
on conflict do nothing;
