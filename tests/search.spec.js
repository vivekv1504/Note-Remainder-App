import { test, expect } from '@playwright/test';

const FIRESTORE_CLEAR_URL =
  'http://localhost:8081/emulator/v1/projects/note-reamainder-app/databases/(default)/documents';

// Clear all Firestore data before each test for a clean slate
test.beforeEach(async ({ page }) => {
  await page.request.delete(FIRESTORE_CLEAR_URL);
});

// ─── Helper: sign in via Firebase Auth Emulator ────────────────────────────
async function signInViaEmulator(page) {
  await page.goto('/');
  await page.waitForFunction(() => typeof window.__testSignIn === 'function', { timeout: 5000 });
  await page.evaluate(() => window.__testSignIn('test@test.com', 'Test1234!'));
  await page.reload();
  await expect(page.locator('.login-card')).not.toBeVisible({ timeout: 10000 });
  await page.waitForFunction(
    () => document.querySelectorAll('.Toastify__toast').length === 0,
    { timeout: 10000 }
  ).catch(() => {});
  console.log('[HELPER] Signed in — app loaded');
}

// ─── Helper: trigger React onChange on a hidden datetime-local input ────────
async function fireReactDateInput(inputLocator, dtLocal) {
  await inputLocator.evaluate((el, val) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    nativeSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, dtLocal);
}

// ─── Helper: tomorrow 10:00 AM as ISO string ──────────────────────────────
function tomorrowAt10am() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

// ─── Helper: create a regular note (Notes tab) ────────────────────────────
async function createNote(page, title) {
  // Make sure we're on the Notes tab
  await page.locator('.nav-item').nth(0).click();
  await page.locator('.fab').click();
  await expect(page.locator('.note-editor')).toBeVisible({ timeout: 5000 });
  await page.locator('.editor-title-input').fill(title);

  // Set a future reminder (required to save)
  const dt = tomorrowAt10am().slice(0, 16);
  await fireReactDateInput(page.locator('[data-testid="test-reminder-input"]'), dt);

  await page.locator('.editor-save').click();
  await expect(page.locator('.note-editor')).not.toBeVisible({ timeout: 5000 });
  console.log(`[HELPER] Note "${title}" created`);
}

// ─── Helper: create a todo (Todo tab) ─────────────────────────────────────
async function createTodo(page, title) {
  await page.locator('.nav-item').nth(1).click();
  await expect(page.locator('.header-title')).toContainText('To-do', { timeout: 3000 });
  await page.locator('.fab').click();
  await expect(page.locator('.quick-todo-container')).toBeVisible({ timeout: 5000 });
  await page.locator('.quick-todo-input').fill(title);

  // Set a future reminder (required to save)
  const dt = tomorrowAt10am().slice(0, 16);
  await fireReactDateInput(page.locator('[data-testid="test-todo-reminder-input"]'), dt);

  await page.locator('.done-btn').click();
  await expect(page.locator('.quick-todo-container')).not.toBeVisible({ timeout: 5000 });
  console.log(`[HELPER] Todo "${title}" created`);
}

// ─── Helper: open the search bar ──────────────────────────────────────────
async function openSearch(page) {
  await page.locator('.header-btn[title="Search"]').click();
  await expect(page.locator('.search-input-new')).toBeVisible({ timeout: 3000 });
  console.log('[HELPER] Search bar opened');
}

// ─── Helper: type into the search bar ─────────────────────────────────────
async function typeSearch(page, query) {
  await page.locator('.search-input-new').fill(query);
  // Small wait for the useMemo filter to re-render
  await page.waitForTimeout(300);
}

// ─── TC_SEARCH_001: Search bar appears and disappears correctly ────────────
test('[TC_SEARCH_001] Search bar toggle — opens and closes', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_001 — Search bar toggle');
  await signInViaEmulator(page);

  // Search bar must be hidden on load
  await expect(page.locator('.search-bar-new')).not.toBeVisible();
  console.log('[PASS] Search bar hidden on initial load');

  // Click 🔍 button — search bar appears
  await page.locator('.header-btn[title="Search"]').click();
  await expect(page.locator('.search-bar-new')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('.search-input-new')).toBeVisible();
  console.log('[PASS] Search bar visible after clicking 🔍 button');

  // Input should auto-focus
  await expect(page.locator('.search-input-new')).toBeFocused();
  console.log('[PASS] Search input is auto-focused');

  // Click ✕ close button — search bar hides and query clears
  await page.locator('.search-close').click();
  await expect(page.locator('.search-bar-new')).not.toBeVisible({ timeout: 3000 });
  console.log('[PASS] Search bar hidden after ✕ click');
});

// ─── TC_SEARCH_002: Search filters notes by title ─────────────────────────
test('[TC_SEARCH_002] Search filters notes by matching title', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_002 — Filter notes by title');
  await signInViaEmulator(page);

  // Seed notes
  await createNote(page, 'Buy Milk');
  await createNote(page, 'Doctor Appointment');
  await createNote(page, 'Buy Groceries');

  // All 3 notes visible before search
  await page.locator('.nav-item').nth(0).click();
  await expect(page.locator('.note-card')).toHaveCount(3, { timeout: 5000 });
  console.log('[PASS] 3 notes visible before search');

  // Open search and type "Buy"
  await openSearch(page);
  await typeSearch(page, 'Buy');

  // Only the 2 "Buy *" notes should remain
  await expect(page.locator('.note-card')).toHaveCount(2, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Buy Milk' })).toBeVisible();
  await expect(page.locator('.note-card-title').filter({ hasText: 'Buy Groceries' })).toBeVisible();
  await expect(page.locator('.note-card-title').filter({ hasText: 'Doctor Appointment' })).not.toBeVisible();
  console.log('[PASS] "Buy" filters to 2 matching notes');
});

// ─── TC_SEARCH_003: Search is case-insensitive ─────────────────────────────
test('[TC_SEARCH_003] Search is case-insensitive', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_003 — Case-insensitive search');
  await signInViaEmulator(page);

  await createNote(page, 'Team Meeting');
  await createNote(page, 'Grocery List');

  await page.locator('.nav-item').nth(0).click();
  await openSearch(page);

  // Lowercase query should match uppercase title
  await typeSearch(page, 'team');
  await expect(page.locator('.note-card')).toHaveCount(1, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Team Meeting' })).toBeVisible();
  console.log('[PASS] Lowercase "team" matches "Team Meeting"');

  // All-caps query
  await typeSearch(page, 'GROCERY');
  await expect(page.locator('.note-card')).toHaveCount(1, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Grocery List' })).toBeVisible();
  console.log('[PASS] Uppercase "GROCERY" matches "Grocery List"');
});

// ─── TC_SEARCH_004: No results shows empty state ──────────────────────────
test('[TC_SEARCH_004] No-match query shows empty state', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_004 — No match empty state');
  await signInViaEmulator(page);

  await createNote(page, 'Morning Run');

  await page.locator('.nav-item').nth(0).click();
  await openSearch(page);
  await typeSearch(page, 'xyznotexist');

  // No note cards rendered
  await expect(page.locator('.note-card')).toHaveCount(0, { timeout: 3000 });
  console.log('[PASS] Zero cards shown for no-match query');

  // Empty state element should be visible
  await expect(page.locator('.empty-state')).toBeVisible();
  console.log('[PASS] Empty-state UI visible when no notes match');
});

// ─── TC_SEARCH_005: Clearing search restores all notes ────────────────────
test('[TC_SEARCH_005] Clearing search query restores all notes', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_005 — Clear search restores results');
  await signInViaEmulator(page);

  await createNote(page, 'Alpha Note');
  await createNote(page, 'Beta Note');
  await createNote(page, 'Gamma Note');

  await page.locator('.nav-item').nth(0).click();
  await openSearch(page);

  // Filter down to 1
  await typeSearch(page, 'Alpha');
  await expect(page.locator('.note-card')).toHaveCount(1, { timeout: 3000 });
  console.log('[PASS] Filtered to 1 note');

  // Clear the input — all 3 should return
  await page.locator('.search-input-new').clear();
  await page.waitForTimeout(300);
  await expect(page.locator('.note-card')).toHaveCount(3, { timeout: 3000 });
  console.log('[PASS] All 3 notes restored after clearing search input');

  // Close via ✕ — search bar hides, all notes remain
  await page.locator('.search-close').click();
  await expect(page.locator('.note-card')).toHaveCount(3, { timeout: 3000 });
  console.log('[PASS] All notes still visible after closing search bar');
});

// ─── TC_SEARCH_006: Search filters todos by title ────────────────────────
test('[TC_SEARCH_006] Search filters todos by matching title', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_006 — Filter todos by title');
  await signInViaEmulator(page);

  // Create todos
  await createTodo(page, 'Call Dentist');
  await createTodo(page, 'Call Bank');
  await createTodo(page, 'Buy Medicine');

  // Switch to To-do tab
  await page.locator('.nav-item').nth(1).click();
  await expect(page.locator('.header-title')).toContainText('To-do');
  await expect(page.locator('.note-card')).toHaveCount(3, { timeout: 5000 });
  console.log('[PASS] 3 todos visible before search');

  // Search for "Call"
  await openSearch(page);
  await typeSearch(page, 'Call');

  await expect(page.locator('.note-card')).toHaveCount(2, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Call Dentist' })).toBeVisible();
  await expect(page.locator('.note-card-title').filter({ hasText: 'Call Bank' })).toBeVisible();
  await expect(page.locator('.note-card-title').filter({ hasText: 'Buy Medicine' })).not.toBeVisible();
  console.log('[PASS] "Call" filters to 2 matching todos');
});

// ─── TC_SEARCH_007: Search is scoped to active tab ────────────────────────
// Notes and todos are in separate tabs — searching on the Notes tab must
// NOT show todo items even if the query would match them, and vice-versa.
test('[TC_SEARCH_007] Search is scoped to the active tab', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_007 — Search scoped to active tab');
  await signInViaEmulator(page);

  // Create one item in each tab with the same keyword
  await createNote(page, 'Project Plan');
  await createTodo(page, 'Project Review');

  // ── Notes tab: search "Project" ────────────────────────────────────────
  await page.locator('.nav-item').nth(0).click();
  await openSearch(page);
  await typeSearch(page, 'Project');

  // Only the note shows — todo must NOT appear on the Notes tab
  await expect(page.locator('.note-card')).toHaveCount(1, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Project Plan' })).toBeVisible();
  console.log('[PASS] Notes tab shows only the note, not the todo');

  // Close search and switch to Todo tab
  await page.locator('.search-close').click();
  await page.locator('.nav-item').nth(1).click();
  await expect(page.locator('.header-title')).toContainText('To-do');

  // ── Todo tab: same query ────────────────────────────────────────────────
  await openSearch(page);
  await typeSearch(page, 'Project');

  // Only the todo shows — note must NOT appear on the Todo tab
  await expect(page.locator('.note-card')).toHaveCount(1, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Project Review' })).toBeVisible();
  console.log('[PASS] Todo tab shows only the todo, not the note');
});

// ─── TC_SEARCH_008: Partial match works mid-word ──────────────────────────
test('[TC_SEARCH_008] Partial / mid-word search returns correct results', async ({ page }) => {
  console.log('[TEST] TC_SEARCH_008 — Partial / mid-title search');
  await signInViaEmulator(page);

  await createNote(page, 'Dentist Appointment');
  await createNote(page, 'Gym Appointment');
  await createNote(page, 'Weekly Review');

  await page.locator('.nav-item').nth(0).click();
  await openSearch(page);

  // "ppointment" is a mid-word substring of "Appointment"
  await typeSearch(page, 'ppointment');
  await expect(page.locator('.note-card')).toHaveCount(2, { timeout: 3000 });
  await expect(page.locator('.note-card-title').filter({ hasText: 'Dentist Appointment' })).toBeVisible();
  await expect(page.locator('.note-card-title').filter({ hasText: 'Gym Appointment' })).toBeVisible();
  await expect(page.locator('.note-card-title').filter({ hasText: 'Weekly Review' })).not.toBeVisible();
  console.log('[PASS] Partial mid-word "ppointment" matches both Appointment notes');
});
