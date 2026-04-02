import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.TEST_URL || 'https://resonance-network-gkz603gma-resonance-art-collectives-projects.vercel.app'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    screenshot: 'on',
    trace: 'off',
  },
  projects: [
    // Mobile devices
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iphone-chrome',
      use: {
        ...devices['iPhone 14'],
        browserName: 'chromium',
      },
    },
    {
      name: 'pixel-android',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'ipad',
      use: { ...devices['iPad Pro 11'] },
    },
    // Desktop browsers
    {
      name: 'chrome-desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        browserName: 'firefox',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'safari-desktop',
      use: {
        browserName: 'webkit',
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
})
