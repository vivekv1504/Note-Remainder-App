# 🧪 Testing Guide - Reminder Note App

Complete guide to running end-to-end tests using Playwright and Firebase Emulator.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Test Architecture](#test-architecture)
4. [Running Tests](#running-tests)
5. [Test Files Overview](#test-files-overview)
6. [Troubleshooting](#troubleshooting)
7. [Writing New Tests](#writing-new-tests)

---

## 🔧 Prerequisites

### Required Software

- **Node.js** 18+ installed
- **Firebase CLI** installed globally
- **Playwright** browsers installed

### Installation Commands

```bash
# Check if Firebase CLI is installed
firebase --version

# If not installed, install it globally
npm install -g firebase-tools

# Check if Playwright is installed
npx playwright --version

# Install Playwright browsers
npx playwright install
```

### Verify Setup

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Check Firebase CLI
firebase --version

# Check Playwright
npx playwright --version
```

---

## 🚀 Quick Start

### Three-Terminal Setup (Recommended)

#### Terminal 1: Start Firebase Emulator

```bash
cd /Users/vinvivek/Desktop/Remainder-note-app
npm run emulator
```

**Wait for:**
```
✔  firestore: Emulator started at http://127.0.0.1:8081
✔  auth: Emulator started at http://127.0.0.1:9099
✔  Emulator UI running at http://127.0.0.1:4000
✔  All emulators ready! It is now safe to connect your app.
```

#### Terminal 2: Start Test Frontend Server

```bash
cd /Users/vinvivek/Desktop/Remainder-note-app
npm run dev:test
```

**Wait for:**
```
VITE v8.0.2  ready in XXX ms
➜  Local:   http://localhost:5176/
```

#### Terminal 3: Run Tests

```bash
cd /Users/vinvivek/Desktop/Remainder-note-app
npm test
```

**You should see:**
```
Running 26 tests using 4 workers
  ✓ [login] login page displays all elements correctly
  ✓ [notes] Add note with title only
  ...
  26 passed (45s)
```

---

## 🏗️ Test Architecture

### Ports Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Test Frontend | 5176 | Vite dev server for testing |
| Firebase Auth Emulator | 9099 | Mock authentication |
| Firestore Emulator | 8081 | Mock database |
| Emulator UI | 4000 | Web interface for emulators |

### Why Port 5176?

The test frontend runs on port 5176 (instead of 5173) to:
- Avoid conflicts with the development server
- Use separate Firebase configuration (.env.emulator)
- Isolate test environment from development environment

### Test Environment Variables

The tests use `.env.emulator` file with emulator endpoints:

```env
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_USE_EMULATOR=true
```

---

## 🎯 Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm test

# Run specific test file
npx playwright test tests/login.spec.js

# Run tests with visible browser
npm run test:headed

# Run tests in interactive UI mode
npm run test:ui

# Run tests in debug mode
npx playwright test --debug

# View HTML test report
npm run test:report
```

### Advanced Commands

```bash
# Run specific test by name
npx playwright test --grep "TC_NOTE_001"

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with specific timeout
npx playwright test --timeout 30000

# Run tests and update snapshots
npx playwright test --update-snapshots

# Run failed tests only
npx playwright test --last-failed

# Run tests in parallel (default: 4 workers)
npx playwright test --workers=2
```

### Test Project Selection

```bash
# Run only login tests
npx playwright test --project=login

# Run only notes tests
npx playwright test --project=notes

# Run only notification tests
npx playwright test --project=notifications

# Run only search tests
npx playwright test --project=search
```

---

## 📁 Test Files Overview

### 1. `login.spec.js` - Authentication Tests

**Test Cases:**
- Login page displays all elements correctly
- Sign-in button opens OAuth popup
- Signs in via Firebase Auth Emulator
- App opens successfully after login

**What it tests:**
- Login UI elements
- Firebase Auth integration
- OAuth flow
- Post-login navigation

**Run:**
```bash
npx playwright test tests/login.spec.js
```

---

### 2. `notes.spec.js` - Core Note Features

**Test Cases:**
- `[TC_NOTE_001]` Add note with title only
- `[TC_NOTE_002]` Add note with title and body
- `[TC_NOTE_003]` Add note via Quick Todo mode
- `[TC_NOTE_004]` Character count updates in real-time
- `[TC_REMINDER_001]` Set reminder in 12-hour format
- `[TC_REMINDER_002]` Calendar prevents past date selection
- `[TC_REMINDER_003]` Save note with reminder and verify persistence
- `[TC_VALIDATION_001]` Required fields validation on save
- `[TC_UI_001]` Calendar displays inline, not fullscreen
- `[TC_UI_002]` Set Reminder button displays correct text
- `[TC_FORMAT_001]` Text formatting toolbar - bold, italic, underline
- `[TC_IMAGE_001]` Image button visible and triggers file input

**What it tests:**
- Note creation and editing
- Rich text formatting
- Reminder functionality
- Calendar UI behavior
- Form validation
- Quick Todo mode
- Image insertion

**Run:**
```bash
npx playwright test tests/notes.spec.js
```

---

### 3. `notifications.spec.js` - Notification System

**Test Cases:**
- `[TC_NOTIF_001]` Reminder toast fires when notifications are enabled
- `[TC_NOTIF_002]` Reminder toast is suppressed when notifications are disabled

**What it tests:**
- Notification permission handling
- Toast notification display
- Reminder triggering
- Settings toggle behavior

**Run:**
```bash
npx playwright test tests/notifications.spec.js
```

---

### 4. `search.spec.js` - Search Functionality

**Test Cases:**
- `[TC_SEARCH_001]` Search bar toggle - opens and closes
- `[TC_SEARCH_002]` Search filters notes by matching title
- `[TC_SEARCH_003]` Search is case-insensitive
- `[TC_SEARCH_004]` No-match query shows empty state
- `[TC_SEARCH_005]` Clearing search query restores all notes
- `[TC_SEARCH_006]` Search filters todos by matching title
- `[TC_SEARCH_007]` Search is scoped to the active tab
- `[TC_SEARCH_008]` Partial / mid-word search returns correct results

**What it tests:**
- Search UI toggle
- Search filtering logic
- Case insensitivity
- Empty state handling
- Tab-scoped searching
- Partial matching

**Run:**
```bash
npx playwright test tests/search.spec.js
```

---

## 🐛 Troubleshooting

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5176
```

**Solution:**
```bash
# Check what's using the port
lsof -i:5176

# Kill the process
lsof -ti:5176 | xargs kill -9

# Restart the test server
npm run dev:test
```

---

### Issue 2: Firebase Emulator Not Running

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:9099
```

**Solution:**
```bash
# Check if emulator is running
lsof -i:9099,8081

# If not running, start it
npm run emulator

# Wait for "All emulators ready!" message
```

---

### Issue 3: Tests Timeout

**Error:**
```
Timeout 10000ms exceeded while waiting for element
```

**Solutions:**

1. **Increase timeout in playwright.config.js:**
```javascript
use: {
  actionTimeout: 15000,  // Increase from 10000
}
```

2. **Check if frontend is running:**
```bash
curl http://localhost:5176
```

3. **Restart all services:**
```bash
# Kill all processes
lsof -ti:5176,8081,9099 | xargs kill -9

# Restart in correct order
# Terminal 1: npm run emulator
# Terminal 2: npm run dev:test
# Terminal 3: npm test
```

---

### Issue 4: Tests Fail After Code Changes

**Error:**
```
Test failed: expected "X" but got "Y"
```

**Solutions:**

1. **Clear browser cache:**
```bash
npx playwright test --clear-cache
```

2. **Regenerate test artifacts:**
```bash
rm -rf playwright-report
rm -rf test-results
npm test
```

3. **Check if frontend changes are reflected:**
```bash
# Restart dev server
# Terminal 2: Ctrl+C, then npm run dev:test
```

---

### Issue 5: Auth Tests Fail

**Error:**
```
Authentication failed or user not logged in
```

**Solutions:**

1. **Ensure emulator is running:**
```bash
# Check emulator status
curl http://127.0.0.1:9099

# Should return Firebase Auth Emulator info
```

2. **Check .env.emulator configuration:**
```bash
cat .env.emulator
# Should have VITE_USE_EMULATOR=true
```

3. **Clear emulator data:**
```bash
# Stop emulator (Ctrl+C in Terminal 1)
# Restart with --clear flag
firebase emulators:start --clear
```

---

### Issue 6: Search Tests Fail

**Error:**
```
Expected search results but got empty list
```

**Solution:**

1. **Ensure notes are created before search:**
   - Search tests create notes programmatically
   - Check if note creation is working in notes.spec.js first

2. **Check search input selector:**
   - Tests use `.search-input` class
   - Verify the class exists in your components

---

### Issue 7: Playwright Browser Not Installed

**Error:**
```
browserType.launch: Executable doesn't exist
```

**Solution:**
```bash
# Install all browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

---

## 📊 Checking Emulator Status

### Emulator UI

Open in browser: **http://localhost:4000**

You can see:
- 👥 Authentication users
- 📄 Firestore collections and documents
- 🔥 Real-time data updates during tests
- 📋 Logs and debugging information

### Command Line Checks

```bash
# Check if emulator is running
firebase emulators:list

# Check emulator ports
lsof -i:8081,9099,4000

# View emulator logs
# (shown in Terminal 1 where emulator is running)
```

---

## ✍️ Writing New Tests

### Test Structure

```javascript
import { test, expect } from '@playwright/test';

// Helper function to sign in (if needed)
async function signIn(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /sign in/i }).click();
  // Wait for auth
  await page.waitForURL('/', { timeout: 10000 });
}

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test('[TC_XXX_001] Test description', async ({ page }) => {
  console.log('[TEST] Starting: Test description');
  
  // Your test steps here
  await page.getByRole('button', { name: 'Add Note' }).click();
  
  // Assertions
  await expect(page.locator('.note-modal')).toBeVisible();
  
  console.log('[PASS] Test passed');
});
```

### Best Practices

1. **Use descriptive test IDs:**
   - `[TC_CATEGORY_###]` format
   - Example: `[TC_NOTE_001]`, `[TC_SEARCH_002]`

2. **Add console logs:**
   ```javascript
   console.log('[TEST] Starting test...');
   console.log('[PASS] Assertion passed');
   ```

3. **Use proper selectors:**
   - Prefer `getByRole()` over `.locator()`
   - Use data-testid attributes for critical elements

4. **Add timeouts for async operations:**
   ```javascript
   await page.waitForSelector('.note-item', { timeout: 5000 });
   ```

5. **Clean up after tests:**
   ```javascript
   test.afterEach(async ({ page }) => {
     // Delete created notes
     // Reset state
   });
   ```

---

## 📈 Test Coverage

### Current Test Statistics

- **Total Tests:** 26
- **Test Files:** 4
- **Test Projects:** 4 (login, notes, notifications, search)

### Coverage by Feature

| Feature | Tests | Coverage |
|---------|-------|----------|
| Authentication | 4 | ✅ High |
| Note Creation | 4 | ✅ High |
| Reminders | 3 | ✅ High |
| Search | 8 | ✅ High |
| Notifications | 2 | ⚠️ Medium |
| UI Components | 3 | ⚠️ Medium |
| Text Formatting | 1 | ⚠️ Low |
| Image Upload | 1 | ⚠️ Low |

---

## 🎓 Additional Resources

### Playwright Documentation
- **Official Docs:** https://playwright.dev/
- **Best Practices:** https://playwright.dev/docs/best-practices
- **API Reference:** https://playwright.dev/docs/api/class-test

### Firebase Emulator
- **Emulator Suite:** https://firebase.google.com/docs/emulator-suite
- **Local Development:** https://firebase.google.com/docs/emulator-suite/connect_and_prototype

### Debugging
- **Playwright Inspector:** `npx playwright test --debug`
- **Trace Viewer:** `npx playwright show-trace trace.zip`
- **VSCode Extension:** Playwright Test for VSCode

---

## 🔄 Continuous Integration (CI)

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: |
          npm run emulator &
          npm run dev:test &
          sleep 10
          npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## ✅ Test Checklist

Before running tests, ensure:

- [ ] Node.js 18+ installed
- [ ] Firebase CLI installed globally
- [ ] Playwright browsers installed
- [ ] All dependencies installed (`npm install`)
- [ ] `.env.emulator` file exists
- [ ] Port 5176 is available
- [ ] Ports 8081, 9099 are available

Before committing changes:

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Test names follow naming convention
- [ ] Console logs added for debugging
- [ ] No hardcoded timeouts (use config)
- [ ] Tests clean up after themselves

---

## 📞 Getting Help

If tests fail and you can't figure out why:

1. **Check the error message carefully**
2. **Look at the screenshot** in `test-results/` folder
3. **Check the trace file** with `npx playwright show-trace`
4. **Run in headed mode** to see what's happening: `npm run test:headed`
5. **Run in debug mode** to step through: `npx playwright test --debug`
6. **Check emulator UI** at http://localhost:4000
7. **Verify all services are running** (emulator + frontend)

---

## 🎉 Success!

If you've made it this far and your tests are passing - congratulations! 🎊

You now have a fully functional end-to-end testing setup for the Reminder Note App.

**Happy Testing! 🧪✨**
