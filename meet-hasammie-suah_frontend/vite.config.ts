import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
    }
  },
  build: {
    rollupOptions: {
      external: [],
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['rxjs'],
  },
})
