import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Situs ini di-deploy ke custom domain (mossain.servant.biz.id) lewat
// repo publik terpisah, jadi base path SELALU root ("/") — bukan
// "/nama-repo/" seperti skema username.github.io/nama-repo.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
