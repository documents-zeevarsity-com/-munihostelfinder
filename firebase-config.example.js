// Copy this file to `firebase-config.js` and replace the placeholder values with your Firebase project credentials.
// Then include `firebase-config.js` in your pages before `firebase-manager.js`.
//
// ⚠️ IMPORTANT: Do NOT commit `firebase-config.js` to source control (it contains API keys).

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",              // e.g. "AIzaSy..."
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Optional: export for module consumers (if using bundler)
if (typeof window !== 'undefined') window.FIREBASE_CONFIG = FIREBASE_CONFIG;
