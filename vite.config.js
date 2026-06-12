import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'pouchdb-browser': path.resolve('./node_modules/pouchdb-browser/lib/index.js'),
      'events': path.resolve('./node_modules/events/events.js'),
    },
  },
  optimizeDeps: {
    include: ['pouchdb-browser', 'events'],
  },
})
