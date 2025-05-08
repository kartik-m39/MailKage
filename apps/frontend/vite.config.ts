import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(), crx({ manifest })],
  build: {
    // Disable HMR for Chrome extension builds
    watch: null,
    // Ensure HMR code is not included in production builds
    minify: true,
  },
  // Disable server options for extensions
  server: {
    hmr: false
  }
})
