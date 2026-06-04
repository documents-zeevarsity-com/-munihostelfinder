# Muni Hostel Finder Backend

This repository includes a new Express-based REST API backend using MySQL and JWT authentication.

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Create the MySQL database and tables using `schema.sql`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users
- `GET /api/users` (super_admin only)

### Hostels
- `GET /api/hostels`
- `GET /api/hostels/:id`
- `POST /api/hostels` (hostel_admin or super_admin)
- `PUT /api/hostels/:id` (hostel_admin or super_admin)
- `DELETE /api/hostels/:id` (hostel_admin or super_admin)

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id/status`

## Notes

- Authentication uses `Authorization: Bearer <token>` headers.
- Passwords are hashed with `bcryptjs`.
- Hostels are returned in active status by default.
- Use the `/api/health` endpoint to verify server availability.
