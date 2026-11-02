import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/app',
  build: { outDir: '../../dist/app', emptyOutDir: true },
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:3217', changeOrigin: true, headers: { origin: 'http://127.0.0.1:3217' } } }
  }
})
