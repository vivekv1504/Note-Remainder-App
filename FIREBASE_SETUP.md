# Firebase Setup Guide

## ✅ Completed Steps

You've already completed the initial Firebase setup. Now follow these final steps:

---

## 📝 Step 1: Update `.env` File with Your Firebase Config

1. Open the `.env` file in your project root
2. Go to [Firebase Console](https://console.firebase.google.com/) > Your Project
3. Click the gear icon ⚙️ > **Project settings**
4. Scroll down to **Your apps** section
5. Find your web app and copy the config values
6. Replace the placeholder values in `.env` with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy... (your actual API key)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

---

## 🔒 Step 2: Set Up Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/) > Your Project
2. Click **Firestore Database** in the left sidebar
3. Click the **Rules** tab
4. Replace the existing rules with the content from `firestore.rules` file in your project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

5. Click **Publish**

These rules ensure:
- Users can only read their own notes
- Users can only create notes with their own userId
- Users can only update/delete their own notes

---

## 🏃 Step 3: Run the App

```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🎉 What's Working Now

✅ **Gmail Authentication** - Users can sign in with their Google account  
✅ **Firestore Storage** - Notes are saved to Firebase (not localStorage)  
✅ **Real-time Sync** - Notes sync across devices automatically  
✅ **User Isolation** - Each user only sees their own notes  
✅ **Secure** - Firestore security rules protect user data

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your domain (e.g., `localhost` for development)

### "Missing or insufficient permissions"
- Make sure you've published the Firestore security rules (Step 2)
- Check that the rules match exactly

### Can't sign in with Google
- Verify Google auth is enabled in Firebase Console > Authentication > Sign-in method
- Check that you selected a support email

---

## 📚 What Changed in the Code

### New Files
- `src/config/firebase.js` - Firebase initialization
- `src/hooks/useAuth.js` - Authentication logic
- `src/components/Login.jsx` - Login UI
- `src/components/Login.css` - Login styles
- `.env` - Firebase config (don't commit this!)
- `.env.example` - Template for environment variables
- `firestore.rules` - Security rules for Firestore

### Updated Files
- `src/App.jsx` - Added authentication flow
- `src/App.css` - Added user info and loading styles
- `src/hooks/useNotes.js` - Changed from localStorage to Firestore
- `.gitignore` - Added `.env` to prevent committing credentials

### What Still Works
- ✅ Dark mode
- ✅ Notifications
- ✅ Calendar date picker
- ✅ Search & filter
- ✅ All CRUD operations

The app now stores everything in Firebase instead of localStorage!
