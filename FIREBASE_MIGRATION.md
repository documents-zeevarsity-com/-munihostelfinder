# Data Migration Guide: localStorage → Firebase

If you've been using this app with **localStorage**, this guide shows how to migrate your data to **Firestore**.

## Option 1: Manual Migration (Easy)

### Step 1: Export Your Data

1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Application** tab → **Local Storage**
4. Find entries like: `secureUsers`, `hostels`, `bookings`, `securityLogs`
5. Right-click each → **Copy Value**
6. Paste into a text file: `data-backup.json`

Example structure:
```json
{
  "users": [...],
  "hostels": [...],
  "bookings": [...]
}
```

### Step 2: Upload to Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Create collections:
   - `users`
   - `hostels`
   - `bookings`

5. For each collection:
   - Click **Add Document**
   - Paste data from your backup
   - Firebase auto-creates IDs

### Step 3: Test

1. Refresh your app in browser
2. Check DevTools Console (F12)
3. Should see: `firebase-manager: initialized Firebase.` ✅
4. Log in — should work with migrated data

---

## Option 2: Automated Migration Script (Advanced)

Use this script to auto-migrate data from localStorage to Firestore:

### Create `migrate-to-firebase.js`

```javascript
/**
 * Migrate data from localStorage to Firestore
 * Run this once in browser console after Firebase is initialized
 */

async function migrateDataToFirebase() {
  if (!window.firebase || !window.firebaseManager) {
    console.error('❌ Firebase not initialized. Make sure firebase-config.js is loaded.');
    return;
  }

  console.log('🚀 Starting migration...');
  
  try {
    // Get references
    const db = firebase.firestore();
    
    // Migrate Users
    const usersData = JSON.parse(localStorage.getItem('secureUsers') || '[]');
    console.log(`📤 Migrating ${usersData.length} users...`);
    
    for (const user of usersData) {
      const docId = user.id || user.email;
      await db.collection('users').doc(docId).set({
        ...user,
        migratedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Users migrated (${usersData.length})`);

    // Migrate Hostels
    const hostelsData = JSON.parse(localStorage.getItem('hostels') || '[]');
    console.log(`📤 Migrating ${hostelsData.length} hostels...`);
    
    for (const hostel of hostelsData) {
      const docId = hostel.id || `hostel-${Date.now()}`;
      await db.collection('hostels').doc(docId).set({
        ...hostel,
        migratedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Hostels migrated (${hostelsData.length})`);

    // Migrate Bookings
    const bookingsData = JSON.parse(localStorage.getItem('bookings') || '[]');
    console.log(`📤 Migrating ${bookingsData.length} bookings...`);
    
    for (const booking of bookingsData) {
      const docId = booking.id || `booking-${Date.now()}`;
      await db.collection('bookings').doc(docId).set({
        ...booking,
        migratedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Bookings migrated (${bookingsData.length})`);

    // Migrate Security Logs
    const logsData = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    console.log(`📤 Migrating ${logsData.length} security logs...`);
    
    for (const log of logsData) {
      const docId = log.id || `log-${Date.now()}`;
      await db.collection('securityLogs').doc(docId).set({
        ...log,
        migratedAt: new Date().toISOString()
      });
    }
    console.log(`✅ Security logs migrated (${logsData.length})`);

    console.log('\n🎉 ✅ Migration complete!');
    console.log('Your data is now in Firestore and synced across devices.');
    console.log('\n📋 Summary:');
    console.log(`   • Users: ${usersData.length}`);
    console.log(`   • Hostels: ${hostelsData.length}`);
    console.log(`   • Bookings: ${bookingsData.length}`);
    console.log(`   • Logs: ${logsData.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateDataToFirebase();
```

### How to Use the Script

1. Set up Firebase (follow FIREBASE_SETUP.md)
2. Open your app in browser
3. Press **F12** → **Console**
4. Paste the script above
5. Press Enter to run
6. Watch the migration progress in console ✅

---

## Option 3: Firebase Import (Fastest)

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Your Firebase project credentials

### Steps

1. **Export from localStorage**
   ```bash
   # In DevTools console, export as JSON
   localStorage.getItem('secureUsers')
   localStorage.getItem('hostels')
   localStorage.getItem('bookings')
   ```

2. **Create import file** (`users.json`):
   ```json
   [
     {
       "fields": {
         "firstName": { "stringValue": "John" },
         "email": { "stringValue": "john@example.com" },
         "role": { "stringValue": "user" }
       }
     }
   ]
   ```

3. **Use Firebase CLI** (advanced):
   ```bash
   firebase firestore:delete users --project=YOUR_PROJECT
   firebase firestore:import ./data/users.json --project=YOUR_PROJECT
   ```

---

## Verification Steps

After migration, verify your data:

### 1. Check Firebase Console

1. Go to Firebase Console
2. Select your project
3. Go to **Firestore Database**
4. Check collections: `users`, `hostels`, `bookings`, `securityLogs`
5. Click each document to verify data

### 2. Check App Behavior

```javascript
// In browser console (F12):
const users = await firebaseManager.getUsers();
console.log('Users from Firestore:', users);
```

Expected output:
```javascript
Users from Firestore: [
  { id: "user-1", firstName: "John", email: "john@example.com", ... },
  { id: "user-2", firstName: "Jane", email: "jane@example.com", ... }
]
```

### 3. Test App Features

- [ ] Sign in with migrated user ✅
- [ ] See users in admin panel ✅
- [ ] View hostels ✅
- [ ] Create new booking ✅
- [ ] Edit user role ✅

---

## Rollback Plan (If Something Goes Wrong)

If migration fails, your **localStorage is still there**:

```javascript
// Immediately reverts to localStorage fallback
// (firebaseManager automatically does this if Firebase fails)

// Check what's in localStorage
Object.keys(localStorage)
// → ["secureUsers", "hostels", "bookings", "securityLogs"]

// App will use this data automatically via securityManager
```

---

## Troubleshooting

### "Firebase not initialized"
- Check firebase-config.js exists and is valid
- Check Firebase SDK loaded in DevTools → Network tab
- Check console for errors (F12)

### "Migration stuck / timeout"
- Your data might be very large
- Reduce batch size in the script
- Try Firebase Console manual import instead

### "Data appears duplicated"
- firebaseManager might be trying both Firebase + localStorage
- Clear localStorage after successful migration:
  ```javascript
  localStorage.clear()
  ```
  ⚠️ **Only after verifying data in Firestore!**

### "I want to keep using localStorage"
- No problem! Just don't set up Firebase credentials
- firebaseManager will keep using localStorage fallback
- Everything continues working

---

## Data Safety During Migration

✅ **Safe practices:**
- localStorage stays intact (no data loss)
- Migration is append-only (won't delete existing data)
- Can retry migration multiple times
- Test in non-production first

⚠️ **After successful migration:**
- Verify data in Firestore Console ✅
- Test app features ✅
- Only then clear localStorage (optional)
- Keep old localStorage backup for 48 hours

---

## Support

Having issues? Check these:

1. **FIREBASE_SETUP.md** — Initial setup
2. **FIREBASE_ARCHITECTURE.md** — How it works
3. **Firebase Documentation** — https://firebase.google.com/docs
4. **Browser Console (F12)** — Check for error messages

---

**You're about to go cloud! 🚀☁️**

Choose your migration method above and get started.
