import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
  await page.goto('/Note-Remainder-App/');
});

test('login page displays all elements correctly', async ({ page }) => {
  // Title and subtitle
  await expect(page.locator('.login-title')).toBeVisible();
  await expect(page.locator('.login-subtitle')).toBeVisible();
  
  // Feature items
  const items = page.locator('.feature-item');
  await expect(items).toHaveCount(4);
  await expect(items.nth(0).locator('.feature-text')).toContainText('Create & manage notes');
  await expect(items.nth(1).locator('.feature-text')).toContainText('Set custom reminders');
  await expect(items.nth(2).locator('.feature-text')).toContainText('Get browser notifications');
  await expect(items.nth(3).locator('.feature-text')).toContainText('Sync across devices');
  
  // Sign-in button and footer
  await expect(page.locator('.google-signin-btn')).toBeVisible();
  await expect(page.locator('.login-footer')).toBeVisible();
});


test('sign-in button opens OAuth popup', async ({ page }) => {
  console.log('[TEST] Clicking sign-in — expecting OAuth popup to open');
  const popupPromise = page.waitForEvent('popup', { timeout: 10000 });
  await page.locator('.google-signin-btn').click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  const url = popup.url();
  console.log('[INFO] Popup URL:', url);
  expect(url).toMatch(/google\.com|firebaseapp\.com/);
  console.log('[PASS] Popup URL is Google/Firebase — OAuth flow triggered');
  await popup.close();
  await expect(page.locator('.login-card')).toBeVisible();
  console.log('[PASS] Login card still visible after popup close');
});

test('signs in via Firebase Auth Emulator — no Google needed', async ({ page }) => {
  console.log('[TEST] Signing in via Auth Emulator — email/password, no Google popup');

  const email = 'test@test.com';
  const password = 'Test1234!';

  // Create test user in emulator (sign up)
  try {
    const signUpResponse = await page.request.post(
      'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key',
      {
        data: { email, password, returnSecureToken: true }
      }
    );
    const signUpData = await signUpResponse.json();
    console.log('[INFO] Created test user in emulator:', signUpData.idToken ? 'Success' : 'Failed');
  } catch (e) {
    console.log('[INFO] Test user may already exist, continuing...');
  }

  // Use the window.__testSignIn helper (exposed in main.jsx when VITE_USE_EMULATOR=true)
  // This calls signInWithEmailAndPassword directly against the emulator
  await page.waitForFunction(() => typeof window.__testSignIn === 'function', { timeout: 5000 });
  await page.evaluate(async (creds) => {
    await window.__testSignIn(creds.email, creds.password);
  }, { email, password });
  console.log('[INFO] signInWithEmailAndPassword called against emulator');

  await page.reload();
  await expect(page.locator('.login-card')).not.toBeVisible({ timeout: 10000 });
  console.log('[PASS] Login card gone — emulator auth successful, app loaded');
});

test('app opens successfully after login with all main elements', async ({ page }) => {
  console.log('[TEST] Verifying app loads correctly after login');

  const email = 'test@test.com';
  const password = 'Test1234!';

  // Create user in Auth Emulator
  try {
    await page.request.post('http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', {
      data: { email, password, returnSecureToken: true }
    });
  } catch (e) {
    console.log('[INFO] Test user already exists');
  }

  // Sign in via emulator
  await page.waitForFunction(() => typeof window.__testSignIn === 'function', { timeout: 5000 });
  await page.evaluate(async (creds) => {
    await window.__testSignIn(creds.email, creds.password);
  }, { email, password });
  console.log('[INFO] Signed in via emulator');

  await page.reload();

  // Check login card is gone
  await expect(page.locator('.login-card')).not.toBeVisible({ timeout: 10000 });
  console.log('[PASS] Login screen hidden');

  // Check main app header
  console.log('[TEST] Checking header elements');
  await expect(page.locator('.app-header-new')).toBeVisible();
  await expect(page.locator('.header-title')).toBeVisible();
  await expect(page.locator('.header-title')).toContainText('Remainder Notes');
  console.log('[PASS] App header visible with correct title');

  // Check bottom navigation
  console.log('[TEST] Checking bottom navigation');
  await expect(page.locator('.bottom-nav')).toBeVisible();
  const navItems = page.locator('.nav-item');
  await expect(navItems).toHaveCount(3);
  await expect(navItems.nth(0)).toContainText('Notes');
  await expect(navItems.nth(1)).toContainText('To-do');
  await expect(navItems.nth(2)).toContainText('Me');
  console.log('[PASS] Bottom navigation visible with 3 tabs');

  // Check floating action button (FAB)
  console.log('[TEST] Checking FAB button');
  await expect(page.locator('.fab')).toBeVisible();
  console.log('[PASS] FAB button visible');

  // Check main content area
  console.log('[TEST] Checking main content area');
  await expect(page.locator('.app-main-new')).toBeVisible();
  console.log('[PASS] Main content area visible');

  // Check profile by clicking Me tab
  console.log('[TEST] Checking profile page');
  await navItems.nth(2).click();
  await expect(page.locator('.profile-page')).toBeVisible();
  await expect(page.locator('.profile-email')).toBeVisible();
  await expect(page.locator('.profile-email')).toContainText('test@test.com');
  console.log('[PASS] Profile page shows with correct email');

  console.log('[SUCCESS] App loaded successfully with all main elements after login');
});
