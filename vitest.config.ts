import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

/**
 * §11 — Vitest + Testing Library.
 *
 * `jsdom` só é necessário para os testes de componente; os de `lib/` rodariam
 * sem ele, e é de propósito que a maior parte da suíte não precise de tela
 * (§10).
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
