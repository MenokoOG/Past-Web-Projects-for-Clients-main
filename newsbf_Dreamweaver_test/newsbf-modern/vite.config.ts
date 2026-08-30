import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The portfolio this app lives in is served by GitHub Pages from the `main`
 * branch at the repository root, so the built demo is committed alongside the
 * other (entirely static) projects rather than deployed by a separate service.
 *
 * Two consequences are configured here:
 *
 *   base    — in production the app is served from a sub-path, not from the
 *             domain root, so asset URLs have to be rewritten. In development
 *             it stays at `/` so `npm run dev` behaves normally.
 *   outDir  — the build lands in `protocol-droid/` at the repository root,
 *             beside the other project folders, which is what gives the demo
 *             a short URL to hand to people.
 *
 * Routing is hash-based, so no server-side rewrite rule is needed and the
 * build also works opened straight from disk.
 */
const REPO_SUBPATH = '/Past-Web-Projects-for-Clients-main/protocol-droid/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPO_SUBPATH : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: fileURLToPath(new URL('../../protocol-droid', import.meta.url)),
    // The output directory sits outside the Vite root, so the overwrite has to
    // be opted into explicitly.
    emptyOutDir: true,
  },
  server: { port: 5173 },
}))
