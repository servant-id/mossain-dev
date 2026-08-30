import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages menyajikan project di https://<user>.github.io/<repo>/
// jadi base path harus diset ke nama repo, bukan root ("/").
// Diambil dari env var yang diisi otomatis oleh GitHub Actions (lihat
// .github/workflows/deploy.yml) — kalau dev lokal, otomatis fallback ke "/".
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES_BASE || '/',
})
