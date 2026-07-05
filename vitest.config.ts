import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.'), '#velite': path.resolve(__dirname, '.velite') },
  },
  test: { include: ['**/*.test.ts'], exclude: ['node_modules', 'e2e', 'out'] },
})
