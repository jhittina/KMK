# JWT Authentication Implementation

## Overview

Complete JWT-based authentication system with role-based access control (RBAC) for KMK Hall & Banquets Event Management System.

## Features

- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin & Staff)
- ✅ Password hashing with bcrypt
- ✅ Protected routes on both frontend and backend
- ✅ Automatic token storage in localStorage
- ✅ User session management
- ✅ Beautiful login page with purple theme

## Roles & Permissions

### Admin

- Full access to all features
- Can manage Config Profile (Categories, Items)
- Can manage Workspace (Packages, Bookings, Customers)
- Can manage users (view, create, update, delete)
- Can change passwords

### Staff

- Read/write access to Workspace features
- Cannot access Config Profile
- Cannot manage users
- Can change own password

## Backend Implementation

### 1. User Model

**Location:** `backend/src/models/User.model.js`

Fields:

- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: ['admin', 'staff'])
- phone (String)
- isActive (Boolean, default: true)

Methods:

- `comparePassword(candidatePassword)` - Compare hashed passwords
- `toJSON()` - Remove password from response

### 2. Auth Controller

**Location:** `backend/src/controllers/auth.controller.js`

Endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)
- `GET /api/auth/users` - Get all users (Admin only)
- `PUT /api/auth/users/:id` - Update user (Admin only)
- `DELETE /api/auth/users/:id` - Delete user (Admin only)

### 3. Auth Middleware

**Location:** `backend/src/middleware/auth.middleware.js`

Functions:

- `protect` - Verify JWT token and authenticate user
- `authorize(...roles)` - Check if user has required role

### 4. Protected Routes

#### Config Routes (Admin Only)

```javascript
// Categories
POST /api/config/categories (Admin)
PUT /api/config/categories/:id (Admin)
DELETE /api/config/categories/:id (Admin)

// Items
POST /api/config/items (Admin)
PUT /api/config/items/:id (Admin)
DELETE /api/config/items/:id (Admin)
```

#### Workspace Routes (All Authenticated Users)

```javascript
// All GET, POST, PUT, DELETE routes require authentication
/api/workspace/packages/*
/api/workspace/bookings/*
/api/workspace/customers/*
```

## Frontend Implementation

### 1. Auth Context

**Location:** `frontend/src/context/AuthContext.js`

Provides:

- `user` - Current user object
- `token` - JWT token
- `loading` - Loading state
- `login(email, password)` - Login function
- `logout()` - Logout function
- `register()` - Register function
- `isAdmin()` - Check if admin
- `isStaff()` - Check if staff
- `isAuthenticated` - Boolean flag

### 2. Protected Route Component

**Location:** `frontend/src/components/ProtectedRoute.js`

Usage:

```jsx
<ProtectedRoute>
  <Component />
</ProtectedRoute>

<ProtectedRoute adminOnly>
  <AdminComponent />
</ProtectedRoute>
```

### 3. Login Page

**Location:** `frontend/src/pages/Login.js`

Features:

- Modern purple-themed design
- Email/password validation
- Show/hide password
- Error handling
- Demo credentials display
- Responsive layout

### 4. Layout Updates

**Location:** `frontend/src/components/Layout/Layout.js`

Features:

- User menu with name, email, and role
- Logout functionality
- Role-based menu filtering
- Shows only accessible routes

## Demo Credentials

### Admin Account

```
Email: admin@kmkhall.com
Password: admin123
```

### Staff Account

```
Email: staff@kmkhall.com
Password: staff123
```

## Environment Variables

Add to `backend/.env`:

```env
JWT_SECRET=kmk_hall_banquets_secret_key_2026_secure_token_for_authentication
JWT_EXPIRE=7d
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install jsonwebtoken bcryptjs

cd ../frontend
# No additional packages needed (using existing axios)
```

### 2. Seed Users

```bash
cd backend
node seedUsers.js
```

This creates:

- Admin user (admin@kmkhall.com / admin123)
- Staff user (staff@kmkhall.com / staff123)

### 3. Start Backend

```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

### 4. Start Frontend

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### 5. Access Application

1. Navigate to http://localhost:3000
2. You'll be redirected to login page
3. Use demo credentials to login
4. Dashboard will load after successful login

## API Usage

### Login

```javascript
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "admin@kmkhall.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Admin",
      "email": "admin@kmkhall.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Authenticated Request

```javascript
GET http://localhost:5001/api/workspace/packages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Features

1. **Password Hashing**
   - All passwords are hashed using bcrypt with salt rounds of 10
   - Passwords are never stored in plain text

2. **JWT Tokens**
   - Tokens expire after 7 days
   - Tokens are signed with a secret key
   - Tokens are verified on every protected route

3. **Role-Based Access**
   - Admin can access all routes
   - Staff can only access workspace routes
   - Config routes are admin-only

4. **Token Storage**
   - Tokens stored in localStorage
   - Automatically attached to all API requests
   - Cleared on logout

5. **Account Status**
   - Users can be deactivated (isActive: false)
   - Deactivated users cannot login

## Error Handling

### Invalid Credentials

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Unauthorized (No Token)

```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### Forbidden (Insufficient Permissions)

```json
{
  "success": false,
  "message": "User role 'staff' is not authorized to access this route"
}
```

### Token Expired

```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

## Testing the System

### Test as Admin

1. Login with admin@kmkhall.com / admin123
2. Access Dashboard ✅
3. Access Categories (Config) ✅
4. Access Items (Config) ✅
5. Access Packages (Workspace) ✅
6. Access Bookings (Workspace) ✅
7. Access Customers (Workspace) ✅

### Test as Staff

1. Login with staff@kmkhall.com / staff123
2. Access Dashboard ✅
3. Access Categories (Config) ❌ (Should redirect)
4. Access Items (Config) ❌ (Should redirect)
5. Access Packages (Workspace) ✅
6. Access Bookings (Workspace) ✅
7. Access Customers (Workspace) ✅

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js       # Authentication logic
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT verification & RBAC
│   ├── models/
│   │   └── User.model.js            # User schema
│   └── routes/
│       ├── auth.routes.js           # Auth endpoints
│       ├── config.routes.js         # Protected config routes
│       └── workspace.routes.js      # Protected workspace routes
├── seedUsers.js                     # Create demo users
└── .env                             # JWT_SECRET, JWT_EXPIRE

frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Layout.js            # Updated with user menu
│   │   └── ProtectedRoute.js        # Route protection
│   ├── context/
│   │   └── AuthContext.js           # Auth state management
│   ├── pages/
│   │   └── Login.js                 # Login UI
│   └── App.js                       # Updated with AuthProvider
```

## Next Steps

1. **Add User Management UI** (Admin only)
   - Create users page
   - Edit/delete users
   - Activate/deactivate accounts

2. **Add Password Reset**
   - Forgot password flow
   - Email verification

3. **Add Refresh Tokens**
   - Implement refresh token rotation
   - Extend session without re-login

4. **Add Activity Logs**
   - Track user actions
   - Audit trail for admin

5. **Add Multi-Factor Authentication**
   - OTP via email/SMS
   - Authenticator app support

---

**Created by:** GitHub Copilot
**Date:** April 20, 2026
**Version:** 1.0.0
