import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // Mock CSS imports from node_modules in tests
      'driver.js/dist/driver.css': path.resolve(__dirname, './src/__mocks__/empty.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest-setup.ts'],
    globals: true,
    env: loadEnv('test', process.cwd(), ''),
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          include: ['**/*.component.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['**/*.integration.test.{ts,tsx}'],
          // Tests use transaction rollback for isolation, enabling parallel execution
        },
      },
    ],
  },
})