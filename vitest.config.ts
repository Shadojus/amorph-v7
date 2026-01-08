import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/pages/**', 'src/layouts/**']
    },
    globals: true,
    // Setup files run before all tests
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@morphs': '/src/morphs',
      '@observer': '/src/observer'
    }
  }
});
