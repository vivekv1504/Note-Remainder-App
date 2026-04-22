import { test, expect } from '@playwright/test';

// Authenticated tests — uses storageState from tests/auth.json
// Capture session once: npx playwright codegen --save-storage=tests/auth.json http://localhost:5173

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('authenticated user lands on app, not login page', async ({ page }) => {
  console.log('[TEST] Checking: authenticated user bypasses login');
  await expect(page.locator('.login-card')).not.toBeVisible({ timeout: 10000 });
  console.log('[PASS] Login card not visible — user is authenticated');
});
