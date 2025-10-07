import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
  },

  // Optional: show traces and screenshots on failure
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: 0,

  projects: [
    {
      name: 'Microsoft Edge',
      use: {
        browserName: 'chromium',
        headless: false, // 👈 show the browser window
        channel: 'msedge', // Use the Chrome browser channel
        viewport: null,
        launchOptions: {
          slowMo: 100, // slows down actions so you can see them
          args: ['--start-maximized'],
        },
      },
    },
  ],
});
