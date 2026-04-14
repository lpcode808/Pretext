import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const EXPERIMENTS_DIR = path.resolve(__dirname, '..')

export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Local pretext dist path — used by global setup to serve it
    baseURL: 'http://localhost:8700',
    trace: 'on-first-retry',
  },

  webServer: {
    command: `node server.js`,
    url: 'http://localhost:8700',
    reuseExistingServer: false,
    timeout: 10_000,
    cwd: __dirname,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
