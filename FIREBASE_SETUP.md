# Firebase/Firestore Setup Guide

This project is configured to work with **Firebase/Firestore** as a free, cloud-based database. No backend server is needed!

## 🚀 Quick Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://firebase.google.com/docs/web/setup)
2. Click **"Create a project"** or use an existing one
3. Choose your project name (e.g., "Muni Hostel Finder")
4. Disable Google Analytics (optional)
5. Click **Create Project**

### Step 2: Register Your Web App

1. In the Firebase Console, click the **Web icon** (</> symbol)
2. App name: `Muni Hostel Finder Web`
3. Click **Register app**
4. You'll see a config like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC7...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 3: Copy Credentials to Your Project

1. Create `firebase-config.js` in your project root (already have example: `firebase-config.example.js`)
2. Paste your config into it:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (typeof window !== 'undefined') window.FIREBASE_CONFIG = FIREBASE_CONFIG;
```

### Step 4: Enable Authentication

In Firebase Console:
1. Go to **Build → Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Click **Save**

### Step 5: Set Up Firestore Database

In Firebase Console:
1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose region (nearest to you)
4. Select **Start in test mode** (for development)
   - ⚠️ **Important**: Before going to production, switch to **Production mode** and set proper security rules
5. Click **Enable**

### Step 6: Configure Firestore Security Rules (Development)

For **testing only**, paste this in Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **IMPORTANT**: This allows any authenticated user to read/write everything. For production, implement proper rules based on user roles.

### Step 7: Verify Setup

1. Open your site in a browser
2. Check browser console (F12) for messages like:
   - `firebase-manager: initialized Firebase.` ✅ 
   - OR `firebase-manager: using local securityManager fallback` (if Firebase isn't loaded)
3. Try signing up / logging in
4. Check **Firestore → Collections** in Firebase Console — you should see `users` collection populated

## 📊 Data Structure

Your data will be stored in Firestore collections:

### `users` Collection
```json
{
  "id": "user-email@domain.com",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+256700000000",
  "role": "super_admin",
  "status": "active",
  "createdAt": "2026-03-03T10:00:00Z",
  "hostelId": "hostel-123" (optional, for hostel admins)
}
```

### `hostels` Collection
```json
{
  "id": "hostel-123",
  "name": "Green Valley Hostel",
  "price": "250000",
  "location": "2.3 km from Campus",
  "ownerId": "admin-user-id",
  "status": "active",
  "capacity": 120
}
```

### `bookings` Collection
```json
{
  "id": "booking-123",
  "userId": "user-123",
  "hostelId": "hostel-123",
  "checkIn": "2026-03-10",
  "checkOut": "2026-03-20",
  "status": "confirmed",
  "amount": 2500000
}
```

## 🔧 How It Works

1. **firebase-config.js** — Your Firebase credentials (never commit to git!)
2. **firebase-manager.js** — Wrapper that:
   - Uses real Firebase when config is loaded
   - Falls back to localStorage (`security.js`) if Firebase isn't available
3. **Updated HTML files** — Include both Firebase SDK and firebase-manager

## 🛡️ Important Security Notes

- ✅ **firebase-config.js** is in `.gitignore` (don't commit credentials)
- ⚠️ Switch from **Test Mode** to **Production Mode** + proper security rules before going live
- 🔐 Use Firebase Authentication (email/password, Google, etc.)
- 📝 Log security events in a separate `securityLogs` collection

## 🆓 Free Tier Limits

- **Storage**: 1GB
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Real-time listeners**: Reasonable usage
- **Authentication**: Free email/password + social logins

Upgrade automatically when needed (no surprises).

## 📚 Useful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Authentication](https://firebase.google.com/docs/auth)

## ❓ Troubleshooting

**Q: "firebase-manager: using local securityManager fallback"**
- A: Firebase SDK not loaded or config missing. Check console for errors, verify firebase-config.js exists.

**Q: Data not appearing in Firestore**
- A: Check browser console for errors. Verify Firestore is enabled in Firebase Console.

**Q: Getting permission denied errors**
- A: Use Test Mode for development (allows writes). Implement proper security rules for production.

**Q: Users can't sign up**
- A: Enable Email/Password authentication in Firebase Console → Authentication → Sign-in method.

---

**Ready?** Replace the localhost/localStorage approach with Firebase by following steps 1-7 above! 🚀
