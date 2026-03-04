# 🚀 Migration Guide — Lovable → Your Own Infrastructure

## What Changed
| Before | After |
|--------|-------|
| `@lovable.dev/cloud-auth-js` | Firebase Auth (your own) |
| Lovable Google OAuth redirect | Firebase `signInWithPopup` (no redirect) |
| `lovable-tagger` vite plugin | Removed |
| Supabase auth via Lovable | Firebase Auth only |
| Supabase DB | Supabase DB (kept, works fine) |

---

## Step 1: Create Your Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add Project** → name it (e.g. `my-games-app`)
3. Disable Google Analytics → **Create Project**

---

## Step 2: Enable Google Sign-In

1. In Firebase Console → **Authentication** → **Get Started**
2. Click **Google** under Sign-in providers
3. Toggle **Enable** → add your support email → **Save**

---

## Step 3: Register Your Web App

1. Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **</>** (Web)
3. Name it → **Register App**
4. Copy the config — it looks like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  storageBucket: "yourapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

---

## Step 4: Add Config to Your Project

Open your `.env` file and fill in the Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourapp
VITE_FIREBASE_STORAGE_BUCKET=yourapp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

---

## Step 5: Install Dependencies

```bash
npm install
```
This will install `firebase` and skip the removed Lovable packages.

---

## Step 6: Add Authorized Domain in Firebase

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domain (e.g. `yourdomain.com` or `yourapp.vercel.app`)
3. `localhost` is already added by default for development

---

## Step 7: Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```
Follow prompts → your app is live with your own domain, zero Lovable branding.

---

## File Structure of Changes

```
src/
├── integrations/
│   ├── firebase/
│   │   └── client.ts          ← NEW: Your Firebase config
│   ├── supabase/
│   │   └── client.ts          ← UPDATED: DB only, no auth
│   └── lovable/               ← DELETED
├── hooks/
│   └── useAuth.tsx            ← UPDATED: Firebase auth
└── pages/
    └── Auth.tsx               ← UPDATED: Firebase Google login
```

---

## Your Database (Supabase)

Your Supabase database is **kept as-is**. It still stores:
- Questions
- User stats
- Game progress
- Achievements

Only the **authentication** moved to Firebase. The database queries in `useUserStats`, `useAIQuestions`, etc. all still work.

---

## Need Help?

- Firebase docs: https://firebase.google.com/docs/auth
- Vercel deploy: https://vercel.com/docs
