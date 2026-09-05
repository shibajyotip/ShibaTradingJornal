import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor bundle for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  // Make sure sw.js and manifest.json are served at root
  publicDir: 'public',
})
