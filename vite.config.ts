import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Easy_GRE_QUANT/' : '/',
  plugins: [react()],
  // react-katex is CommonJS and does `require("katex")`. Left alone, both
  // esbuild's dev-time dependency pre-bundling AND Rollup/Rolldown's
  // production CJS-interop step resolve that to katex's CJS build and, while
  // converting it to ESM, mis-tokenize its multi-letter control words
  // (\frac, \times, \text, etc. only keep their first letter) -- e.g.
  // "\times" renders as the stray command "\t" followed by literal "imes".
  // Aliasing "katex" straight to its own ESM entry point sidesteps the CJS
  // interop step (and thus the bug) in both dev and production builds.
  resolve: {
    alias: [
      // Exact-match only -- a plain object key would also match
      // "katex/dist/katex.min.css" as a prefix and break that import.
      { find: /^katex$/, replacement: 'katex/dist/katex.mjs' },
    ],
  },
  optimizeDeps: {
    exclude: ['katex'],
  },
}))
