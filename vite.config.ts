import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 ahora puedes usar "@/..."
    },
  },
  build: {
    rollupOptions: {
      // Fuerza a NO usar el módulo nativo roto
      external: [],
    },
  },
})