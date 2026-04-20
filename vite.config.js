import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    // ── Dev proxy ────────────────────────────────────────────────────────────
    // Proxies /api/v1/* → local Laravel (http://127.0.0.1:8000)
    // This eliminates CORS entirely during local development.
    //
    // To use:
    //   Set VITE_API_URL=/api/v1  in .env.local  (relative, uses proxy)
    //   Set VITE_API_URL=https://api.pyonea.com/api/v1  in .env  (production)
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