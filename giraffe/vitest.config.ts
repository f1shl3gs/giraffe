import {defineConfig} from 'vitest/config'

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['json', 'html'],
      include: ['src/**'],
      exclude: ['src/**/*.test.*', 'src/**/*.d.ts'],
    },
  },
})
