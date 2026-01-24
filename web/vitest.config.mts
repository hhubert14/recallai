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
  },
})