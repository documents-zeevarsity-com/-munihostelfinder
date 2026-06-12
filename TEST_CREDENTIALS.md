# 🧪 Test Credentials Guide

## Quick Start

You now have **3 test user accounts** with different roles:

| Role | Email | Password |
|------|-------|----------|
| **Student** (user) | `student@test.com` | `Student123` |
| **Hostel Admin** | `admin@test.com` | `Admin123` |
| **Super Admin** | `superadmin@test.com` | `SuperAdmin123` |

---

## 🚀 How to Add Test Users to Your Database

### Option 1: Automatic Seed Script (Recommended)

```bash
# From project root, run:
node seed-test-users.js
```

This will:
- ✅ Hash passwords securely with bcrypt
- ✅ Create the three test users
- ✅ Skip users that already exist
- ✅ Display a summary table

---

### Option 2: Manual SQL Seed

```bash
# Connect to MySQL
mysql -u root -p

# Select your database
USE munihostelfinder;

# Paste the contents of seed-users.sql
```

Or pipe directly:
```bash
mysql -u root -p munihostelfinder < seed-users.sql
```

---

## 🔐 How to Login

### Web UI Login
1. Open `index.html` in your browser (or start your frontend server)
2. Go to Login page
3. Enter one of the test credentials above
4. You'll be redirected based on your role:
   - **Student** → User dashboard (`frontend.html`)
   - **Hostel Admin** → Admin dashboard (`admin_management.html`)
   - **Super Admin** → Backend dashboard (`backend.html`)

### API Login (cURL)

```bash
# Student Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Student123"
  }'

# Response:
# {
#   "user": {
#     "id": 1,
#     "firstName": "John",
#     "lastName": "Student",
#     "email": "student@test.com",
#     "role": "user",
#     "status": "active"
#   },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

```bash
# Hostel Admin Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123"
  }'
```

```bash
# Super Admin Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@test.com",
    "password": "SuperAdmin123"
  }'
```

---

## 🔑 Token Usage

After login, use the `token` in subsequent API requests:

```bash
# Example: Get current user profile
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 What Each Role Can Access

### 👤 Student (user)
- Browse hostels (`GET /api/hostels`)
- View hostel details
- Make bookings (`POST /api/bookings`)
- View own bookings
- Update profile
- Change password

### 🏢 Hostel Admin (hostel_admin)
- Manage own hostel details
- View hostel bookings
- Accept/reject bookings
- Upload photos
- Manage hostel information
- View analytics for own hostel

### 👨‍💼 Super Admin (super_admin)
- **Full system access**
- Manage all users
- Manage all hostels
- View all bookings
- System analytics
- Security logs
- User role management

---

## 🔧 Troubleshooting

**Problem**: "Invalid credentials" error
- ✅ Check email is exactly: `student@test.com` (lowercase)
- ✅ Check password is exact: `Student123` (case-sensitive)

**Problem**: "User not found"
- ✅ Run the seed script first: `node seed-test-users.js`
- ✅ Verify database is running: `mysql -u root -p -e "SELECT COUNT(*) FROM munihostelfinder.users;"`

**Problem**: Backend not running
- ✅ Start backend: `npm run dev`
- ✅ Verify port 4000 is listening: `netstat -an | grep 4000`

---

## 📝 Notes

- Test credentials are meant for **development only**
- Do NOT use these in production
- Passwords are hashed with bcrypt (12 rounds)
- Change passwords after first login for real use
- Each role has different dashboard views and permissions
