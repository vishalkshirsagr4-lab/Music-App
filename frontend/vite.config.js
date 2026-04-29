import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Fix PWA refresh 404
  preview: {
    port: 4173,
    strictPort: true,
    open: true,
  },
  server: {
    port: 5173,
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
