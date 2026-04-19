import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    proxy: {
      "/api/v1": "http://127.0.0.1:8000"
    }
  },

  build: {
    // Never ship source maps in production — exposes full source code to anyone
    sourcemap: mode === 'development' ? 'inline' : false,

    // Remove console.log/debug calls in production build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // strips all console.* calls
        drop_debugger: true,  // strips debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
    },

    // Raise chunk size warning threshold (default 500KB is often hit by recharts)
    chunkSizeWarningLimit: 1000,
  },
}));