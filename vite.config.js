import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,        // listen on 0.0.0.0 — lets mobile on same WiFi connect
    port: 5173,
    proxy: {
      '/menu-items': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/create-order': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5174,
  },
})
