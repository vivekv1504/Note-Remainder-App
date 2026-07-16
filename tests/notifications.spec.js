import { test, expect } from '@playwright/test';

const FIRESTORE_CLEAR_URL =
  'http://localhost:8081/emulator/v1/projects/note-reamainder-app/databases/(default)/documents';

// Clear all Firestore data before each test so stale past-due notes never
// accidentally fire toasts and pollute assertion results.
test.beforeEach(async ({ page }) => {
  await page.request.delete(FIRESTORE_CLEAR_URL);
});

// ─── Helper: sign in via Firebase Auth Emulator ────────────────────────────
async function signInViaEmulator(page) {
  const email = 'test@test.com';
  const password = 'Test1234!';

  // Create user in Auth Emulator
  try {
    await page.request.post('http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', {
      data: { email, password, returnSecureToken: true }
    });
    console.log('[HELPER] Created new test user in emulator');
  } catch (e) {
    console.log('[HELPER] Test user already exists, continuing...');
  }

  await page.goto('/');
  await page.waitForFunction(() => typeof window.__testSignIn === 'function', { timeout: 5000 });
  await page.evaluate(async (creds) => {
    await window.__testSignIn(creds.email, creds.password);
  }, { email, password });
  await page.reload();
  await expect(page.locator('.login-card')).not.toBeVisible({ timeout: 10000 });
  // Wait for any lingering toasts to clear before the test body begins
  await page.waitForFunction(
    () => document.querySelectorAll('.Toastify__toast').length === 0,
    { timeout: 10000 }
  ).catch(() => {});
  console.log('[HELPER] Signed in via emulator — app loaded');
}

// ─── Helper: trigger React onChange on a hidden datetime-local input ────────
// React ignores plain DOM assignment — must use the native prototype setter
// then fire both 'input' and 'change' so the synthetic handler runs.
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

// ─── Helper: navigate to the Settings panel (me tab → Settings button) ─────
async function goToSettings(page) {
  // Click the "me" tab in the bottom nav
  await page.locator('.nav-item').nth(2).click();
  // The profile page shows a Settings nav button — click it to open the Settings panel
  await page.locator('.setting-item-nav').filter({ hasText: 'Settings' }).click();
  // Wait until the Notifications toggle is visible inside the Settings panel
  await expect(
    page.locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
  ).toBeVisible({ timeout: 5000 });
}

// ─── Helper: open note editor ──────────────────────────────────────────────
async function openNoteEditor(page) {
  await page.locator('.fab').click();
  await expect(page.locator('.note-editor')).toBeVisible({ timeout: 5000 });
  console.log('[HELPER] Note editor opened');
}

// ─── Helper: save a note with a reminder time 1 minute in the past ──────────
// Sets reminderTime via the hidden test input so datetime-local bypasses the
// calendar widget. Clears lastNotifiedAt so the hook treats it as a fresh
// (never-shown) reminder on the very next 1-second interval check.
async function createNoteWithPastReminder(page, title) {
  await openNoteEditor(page);
  await page.locator('.editor-title-input').fill(title);

  // 1 minute ago — already due, not in the future
  const pastTime = toLocalInputValue(Date.now() - 60 * 1000);
  await fireReactDateInput(
    page.locator('[data-testid="test-reminder-input"]'),
    pastTime
  );

  // Remove lastNotifiedAt so useNotifications.isFreshReminder === true
  await page.evaluate(() => localStorage.removeItem('lastNotifiedAt'));

  await page.locator('.editor-save').click();
  await expect(page.locator('.note-editor')).not.toBeVisible({ timeout: 5000 });
  console.log(`[HELPER] Note "${title}" saved with past-due reminder`);
}

// ─── Helper: build a datetime-local wall-clock string (YYYY-MM-DDTHH:mm) ────
// datetime-local values are LOCAL wall-clock time. Using a raw UTC ISO string
// here would be reinterpreted as local and shift by the timezone offset, so we
// subtract the offset before slicing.
function toLocalInputValue(ms) {
  const d = new Date(ms);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}

// ─── Helper: save a note with a reminder time in the FUTURE ─────────────────
// A properly-set future reminder must NOT fire until its time arrives. This
// guards against the picker bug where reminders defaulted to ~now and fired
// instantly on save/reopen.
async function createNoteWithFutureReminder(page, title, minutesAhead = 30) {
  await openNoteEditor(page);
  await page.locator('.editor-title-input').fill(title);

  const futureTime = toLocalInputValue(Date.now() + minutesAhead * 60 * 1000);
  await fireReactDateInput(
    page.locator('[data-testid="test-reminder-input"]'),
    futureTime
  );

  await page.evaluate(() => localStorage.removeItem('lastNotifiedAt'));

  await page.locator('.editor-save').click();
  await expect(page.locator('.note-editor')).not.toBeVisible({ timeout: 5000 });
  console.log(`[HELPER] Note "${title}" saved with reminder ${minutesAhead}m ahead`);
}

// ─── TC_NOTIF_001: Toast fires when notifications are ENABLED ──────────────
test('[TC_NOTIF_001] Reminder toast fires when notifications are enabled', async ({ page }) => {
  console.log('[TEST] TC_NOTIF_001 — Toast fires with notifications enabled');
  await signInViaEmulator(page);

  // ── Step 1: Ensure notifications are ON in Settings ──────────────────────
  await goToSettings(page);
  // The toggle-switch <label> wraps the hidden <input> — click the label, not the input,
  // because the checkbox itself has opacity:0 / pointer-events:none styling.
  const notifToggle = page
    .locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
    .locator('.toggle-switch');
  const notifCheckbox = page
    .locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
    .locator('input[type="checkbox"]');

  if (!(await notifCheckbox.isChecked())) {
    await notifToggle.click();
    await expect(notifCheckbox).toBeChecked({ timeout: 3000 });
    console.log('[INFO] Notifications were OFF — turned ON');
  } else {
    console.log('[INFO] Notifications already enabled');
  }

  await expect(
    page.locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
      .locator('.setting-description')
  ).toContainText('Enabled');
  console.log('[PASS] Settings shows "Enabled"');

  // ── Step 2: Create a note with a past-due reminder ───────────────────────
  await page.locator('.nav-item').nth(0).click();
  await createNoteWithPastReminder(page, 'Dentist Appointment');

  // ── Step 3: Toast must appear within 2 seconds (hook checks every 1s) ────
  await expect(page.locator('.Toastify__toast')).toBeVisible({ timeout: 5000 });
  console.log('[PASS] Toast notification appeared');

  // ── Step 4: Verify toast content ──────────────────────────────────────────
  await expect(page.locator('.Toastify__toast')).toContainText('⏰ Reminder!');
  await expect(page.locator('.Toastify__toast')).toContainText('Dentist Appointment');
  console.log('[PASS] Toast contains "⏰ Reminder!" and note title');

  // ── Step 5: "Mark as Complete" action button present ─────────────────────
  await expect(
    page.locator('.Toastify__toast').locator('text=✓ Mark as Complete')
  ).toBeVisible();
  console.log('[PASS] "✓ Mark as Complete" button present in toast');
});

// ─── TC_NOTIF_002: Toast is suppressed when notifications are DISABLED ──────
test('[TC_NOTIF_002] Reminder toast is suppressed when notifications are disabled', async ({ page }) => {
  console.log('[TEST] TC_NOTIF_002 — Toast suppressed with notifications disabled');
  await signInViaEmulator(page);

  // ── Step 1: Turn notifications OFF in Settings ───────────────────────────
  await goToSettings(page);
  const notifToggle = page
    .locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
    .locator('.toggle-switch');
  const notifCheckbox = page
    .locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
    .locator('input[type="checkbox"]');

  if (await notifCheckbox.isChecked()) {
    await notifToggle.click();
    await expect(notifCheckbox).not.toBeChecked({ timeout: 3000 });
    console.log('[INFO] Notifications turned OFF');
  } else {
    console.log('[INFO] Notifications already disabled');
  }

  // Description text must confirm disabled state
  await expect(
    page.locator('.setting-item-toggle').filter({ hasText: 'Notifications' })
      .locator('.setting-description')
  ).toContainText('Disabled');
  console.log('[PASS] Settings shows "Disabled"');

  // ── Step 2: Create a note with a past-due reminder ───────────────────────
  await page.locator('.nav-item').nth(0).click();
  await createNoteWithPastReminder(page, 'Gym Session');

  // ── Step 3: Wait 4 seconds — hook runs every 1s but must stay silent ─────
  await page.waitForTimeout(4000);
  await expect(page.locator('.Toastify__toast')).not.toBeVisible();
  console.log('[PASS] No toast appeared — reminder suppressed while notifications disabled');

  // ── Step 4: Re-enable notifications ──────────────────────────────────────
  await goToSettings(page);
  await notifToggle.click();
  await expect(notifCheckbox).toBeChecked({ timeout: 3000 });
  console.log('[INFO] Notifications re-enabled');

  // ── Step 5: Return to notes and clear lastNotifiedAt so hook sees the note
  //    as a fresh (never-notified) entry on the next interval tick ──────────
  await page.locator('.nav-item').nth(0).click();
  await page.evaluate(() => localStorage.removeItem('lastNotifiedAt'));

  // ── Step 6: Toast must now fire within 2 seconds ─────────────────────────
  await expect(page.locator('.Toastify__toast')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.Toastify__toast')).toContainText('Gym Session');
  console.log('[PASS] Toast fires immediately after re-enabling notifications');
});

// ─── TC_NOTIF_003: A FUTURE reminder must NOT fire immediately ─────────────
// Regression test for the "reminder triggers suddenly" bug. A reminder set for
// a future time should stay silent until it is actually due.
test('[TC_NOTIF_003] Future reminder does not fire immediately', async ({ page }) => {
  console.log('[TEST] TC_NOTIF_003 — Future reminder stays silent');
  await signInViaEmulator(page);

  // Create a note due 30 minutes from now
  await createNoteWithFutureReminder(page, 'Future Meeting', 30);

  // Wait several interval ticks — no toast should ever appear
  await page.waitForTimeout(4000);
  await expect(page.locator('.Toastify__toast')).not.toBeVisible();
  console.log('[PASS] No toast for a future reminder');
});

// ─── TC_NOTIF_004: Reopening the app does not re-burst a shown reminder ─────
// Regression test for the reopen-burst bug. Once a due reminder has fired and
// been persisted (reminderTriggeredAt), a reload within the repeat window must
// not immediately re-alert.
test('[TC_NOTIF_004] Reopening does not re-burst an already-triggered reminder', async ({ page }) => {
  console.log('[TEST] TC_NOTIF_004 — No re-burst on reopen');
  await signInViaEmulator(page);

  // Create a past-due reminder and let it fire once
  await createNoteWithPastReminder(page, 'Standup Call');
  await expect(page.locator('.Toastify__toast')).toBeVisible({ timeout: 5000 });
  console.log('[PASS] Reminder fired the first time');

  // Simulate closing/reopening the app on a device with no local dedup state.
  // The Firestore-persisted reminderTriggeredAt should suppress the re-alert.
  await page.evaluate(() => localStorage.removeItem('lastNotifiedAt'));
  await page.reload();
  await expect(page.locator('.login-card')).not.toBeVisible({ timeout: 10000 });

  await page.waitForTimeout(4000);
  await expect(page.locator('.Toastify__toast')).not.toBeVisible();
  console.log('[PASS] No re-burst after reopening the app');
});
