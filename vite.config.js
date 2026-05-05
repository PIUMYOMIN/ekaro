import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    // ── Dev proxy ────────────────────────────────────────────────────────────
    // Only used when VITE_API_URL is relative, e.g. /api/v1
    // Proxies /api/* → local Laravel (http://127.0.0.1:8000) — no CORS.
    //
    // Local UI + local API:  VITE_API_URL=/api/v1  (and VITE_IMAGE_BASE_URL=http://127.0.0.1:8000/storage)
    // Local UI + live API:    VITE_API_URL=https://api.pyonea.com/api/v1  (see .env.example)
    // Production build:       values from .env.production (no proxy)
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Never ship source maps in production — exposes full source code
    sourcemap: mode === 'development' ? 'inline' : false,

    // Strip console.* calls from production bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
    },

    chunkSizeWarningLimit: 1000,
  },
}));