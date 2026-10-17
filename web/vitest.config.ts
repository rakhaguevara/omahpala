import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Dua jenis tes, keduanya jalan di Node:
//   src/**/*.test.ts            — logika murni frontend (parser token QR, pelacak scroll, dst.)
//   supabase/tests/**/*.test.ts — migration SQL asli dijalankan di PGlite (Postgres WASM)
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'supabase/tests/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
})
