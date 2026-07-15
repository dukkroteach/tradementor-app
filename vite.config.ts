import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<owner>.github.io/tradementor-app/ as a GitHub Pages project site.
export default defineConfig({
  base: '/tradementor-app/',
  plugins: [react()],
})
