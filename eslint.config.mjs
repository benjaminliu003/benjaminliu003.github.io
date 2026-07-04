import { defineConfig, globalIgnores } from 'eslint/config'
import next from 'eslint-config-next'

export default defineConfig([
  ...next,
  globalIgnores([
    '.next/**',
    'out/**',
    '.velite/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
  ]),
])
