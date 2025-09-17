import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      // Any request starting with "/api" will be forwarded
      '/api': {
        target: 'http://localhost:5001', // Your backend server URL
        changeOrigin: true, // Recommended for virtual hosted sites
      },
    },
  },
})
