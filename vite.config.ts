import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Easy_GRE_QUANT/' : '/',
  plugins: [react()],
  // esbuild's dependency pre-bundling mis-tokenizes katex's multi-letter
  // control words (\frac, \times, etc. only keep their first letter) when
  // katex is bundled together with react-katex; excluding it from
  // optimizeDeps serves katex's own ESM build unbundled, which is correct.
  optimizeDeps: {
    exclude: ['katex'],
  },
}))
