import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
  },

  reporter: [['list'], ['html', { open: 'never' }]],
  retries: 0,

  projects: [
    {
      name: 'Microsoft Edge',
      use: {
        browserName: 'chromium',
        headless: false, 
        channel: 'msedge', 
        viewport: null,
        launchOptions: {
          slowMo: 100, 
          args: ['--start-maximized'],
        },
      },
    },
  ],
});
