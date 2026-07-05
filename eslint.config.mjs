import { defineConfig, globalIgnores } from 'eslint/config'
import next from 'eslint-config-next'

export default defineConfig([
  ...next,
  {
    rules: {
      // This site is a static export with images.unoptimized, so next/image
      // provides no optimization over <img> — and its wrapper span would break
      // the 3D-transformed stackup layers. Plain <img> is the correct choice.
      '@next/next/no-img-element': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    '.velite/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**',
  ]),
])
