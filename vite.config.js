import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Vite will build index.html as main site; we'll copy panel.html and manifest.json manually in scripts or public.
        main: 'index.html'
      },
      output: {
        // Ensure consistent chunking for Chrome extension
        manualChunks: undefined
      }
    }
  },
  base: '/', // Use absolute paths for Chrome extension
  publicDir: 'public'
})

