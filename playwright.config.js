// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'fs';

// Load test credentials from .env.test (gitignored — never committed)
try {
  readFileSync('.env.test', 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });
} catch {}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
     baseURL: 'http://localhost:5176',
    /* Slow down every action so tests are visually easy to follow */
    launchOptions: {
      slowMo: 1000,
    },

    /* Wait up to 10 seconds for each assertion */
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      // Login page tests — no storageState so page starts unauthenticated
      name: 'login',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/login.spec.js',
    },
    {
      // Note/reminder/UI tests — signs in via emulator inside each test
      name: 'notes',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/notes.spec.js',
    },
    {
      // Notification toast tests — enabled/disabled toggle behaviour
      name: 'notifications',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/notifications.spec.js',
    },
    {
      // Search tests — notes and todos filter by title
      name: 'search',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/search.spec.js',
    },
   ],
});

