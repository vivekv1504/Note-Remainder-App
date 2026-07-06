# 🔧 Test Failures - Analysis & Fixes

## Issues Found

### ❌ **Issue 1: `window.__testSignIn` function not available**

**Error:**
```
TimeoutError: page.waitForFunction: Timeout 10000ms exceeded.
await page.waitForFunction(() => typeof window.__testSignIn === 'function')
```

**Root Cause:**
- The `.env.emulator` file only had `VITE_USE_EMULATOR=true`
- Missing Firebase configuration variables
- Vite wasn't loading `.env.emulator` for the test server

**Fix Applied:**
1. ✅ Updated `.env.emulator` with all Firebase config variables
2. ✅ Changed test script to: `vite --port 5176 --mode emulator`
   - This tells Vite to load `.env.emulator` file

---

### ❌ **Issue 2: EMAIL_NOT_FOUND error**

**Error:**
```
Error: Emulator user not found: {"error":{"code":400,"message":"EMAIL_NOT_FOUND"}}
```

**Root Cause:**
- Test user `test@test.com` doesn't exist in Firebase Auth Emulator
- Emulator starts fresh each time (no persistent users)

**Solution:**
Tests need to create the user first OR use the `__testSignIn` function which handles this automatically when properly configured.

---

## ✅ Fixes Applied

### 1. Updated `.env.emulator`

**Before:**
```env
VITE_USE_EMULATOR=true
```

**After:**
```env
VITE_USE_EMULATOR=true

# Firebase Configuration (required even for emulator)
VITE_FIREBASE_API_KEY=AIzaSyAJvmLQoC6cXFmez7l6F-XoWjQ5vCnKeFM
VITE_FIREBASE_AUTH_DOMAIN=note-reamainder-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=note-reamainder-app
VITE_FIREBASE_STORAGE_BUCKET=note-reamainder-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1059792802349
VITE_FIREBASE_APP_ID=1:1059792802349:web:159ea06873e26815e6dea4
```

### 2. Updated `package.json` test script

**Before:**
```json
"dev:test": "vite --port 5176"
```

**After:**
```json
"dev:test": "vite --port 5176 --mode emulator"
```

The `--mode emulator` flag tells Vite to load `.env.emulator` instead of `.env`

---

## 🔄 How to Restart Tests

### Step 1: Kill all processes

```bash
# Kill test frontend
lsof -ti:5176 | xargs kill -9

# Kill emulator (Ctrl+C in Terminal 1)
```

### Step 2: Restart in correct order

**Terminal 1: Start Emulator**
```bash
cd /Users/vinvivek/Desktop/Remainder-note-app
npm run emulator
```

Wait for:
```
✔  All emulators ready!
```

**Terminal 2: Start Test Frontend (with new config)**
```bash
cd /Users/vinvivek/Desktop/Remainder-note-app
npm run dev:test
```

Wait for:
```
VITE v8.0.2  ready in XXX ms
➜  Local:   http://localhost:5176/
```

**Terminal 3: Run Tests**
```bash
cd /Users/vinvivek/Desktop/Remainder-note-app
npm test
```

---

## 🧪 Verify Fix

### Test 1: Check if environment variables are loaded

Open browser console at http://localhost:5176 and run:
```javascript
console.log(import.meta.env.VITE_USE_EMULATOR);
console.log(import.meta.env.VITE_FIREBASE_API_KEY);
```

Should show:
```
"true"
"AIzaSyA..."
```

### Test 2: Check if __testSignIn is available

```javascript
console.log(typeof window.__testSignIn);
```

Should show:
```
"function"
```

### Test 3: Run a single test

```bash
npx playwright test tests/login.spec.js --headed
```

Watch the browser - you should see the test execute successfully.

---

## 📊 Expected Test Results After Fix

```
Running 26 tests using 4 workers

✓ [login] login page displays all elements correctly (1.2s)
✓ [login] sign-in button opens OAuth popup (0.8s)
✓ [login] signs in via Firebase Auth Emulator (2.1s)
✓ [login] app opens successfully after login (1.5s)
✓ [notes] [TC_NOTE_001] Add note with title only (3.2s)
✓ [notes] [TC_NOTE_002] Add note with title and body (3.5s)
... (all 26 tests)

26 passed (45-60s)
```

---

## 🐛 Still Failing?

### Debug Checklist

- [ ] Emulator is running (check http://localhost:4000)
- [ ] Test frontend is running on port 5176
- [ ] `.env.emulator` file has all Firebase config
- [ ] `npm run dev:test` uses `--mode emulator` flag
- [ ] Browser console shows `VITE_USE_EMULATOR=true`
- [ ] `window.__testSignIn` is a function
- [ ] No console errors on page load

### Debug Commands

```bash
# Check what's running
lsof -i:5176,8081,9099

# Check test frontend environment
curl http://localhost:5176

# Check emulator status
curl http://localhost:9099

# Run single test in debug mode
npx playwright test tests/login.spec.js --debug

# Run with browser visible
npx playwright test tests/login.spec.js --headed
```

---

## 📝 Summary

**Problems:**
1. ❌ Missing Firebase config in `.env.emulator`
2. ❌ Vite not loading `.env.emulator` for test server

**Solutions:**
1. ✅ Added all Firebase config to `.env.emulator`
2. ✅ Updated test script to use `--mode emulator`

**Next Steps:**
1. Restart emulator and test frontend
2. Run tests again
3. All 26 tests should pass ✅

---

## ✅ Verification

After restarting, run this to verify:

```bash
# Terminal 1: Emulator running
# Terminal 2: Test frontend running
# Terminal 3:
npm test
```

Should see:
```
26 passed (XX seconds)
```

🎉 **Tests should now pass!**
