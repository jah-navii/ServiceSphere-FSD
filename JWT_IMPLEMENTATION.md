# JWT Authentication Implementation Guide

## Overview

This project now uses **JWT (JSON Web Token)** based authentication instead of session-based authentication. This provides better scalability, stateless authentication, and easier mobile/SPA integration.

## What Changed

### 1. **Password Security**
- All passwords are now hashed using `bcryptjs` before storing in the database
- Password comparison is done securely during login

### 2. **Authentication Method**
- **Before**: Session-based (using `express-session`)
- **After**: JWT token-based authentication

### 3. **Updated Files**

#### Server-Side Changes:
- **`server/utils/jwtUtils.js`** - New utility functions for JWT generation and verification
- **`server/middleware/authMiddleware.js`** - Updated to verify JWT tokens
- **`server/controllers/authController.js`** - Updated signup/login for Helper and Seeker
- **`server/controllers/adminController.js`** - Updated signup/login for Admin
- **`server/controllers/seekerController.js`** - Updated to use `req.user` instead of `req.session.user`
- **`server/controllers/bookingController.js`** - Updated to use `req.user` instead of `req.session.user`
- **`server/.env`** - Added JWT configuration

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345678
JWT_EXPIRES_IN=7d
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

## How JWT Authentication Works

### 1. **Signup Process**
```
Client → POST /signup → Server hashes password → Saves to DB → Success response
```

### 2. **Login Process**
```
Client → POST /login → Server verifies password → Generates JWT token → Returns token + user data
```

Example Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seeker"
  }
}
```

### 3. **Making Authenticated Requests**

The client must include the JWT token in the Authorization header:

```javascript
Authorization: Bearer <token>
```

Example using fetch:
```javascript
fetch('http://localhost:5000/api/seeker/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### 4. **Logout Process**
- Client removes the token from localStorage/sessionStorage
- Optional: Call `/logout` endpoint for logging purposes

## Client-Side Implementation

### Storing the Token

After successful login, store the token in localStorage:

```javascript
// Login function
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/login/seeker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect or update UI
  }
};
```

### Making Authenticated API Calls

```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/seeker/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};
```

### Logout Function

```javascript
const logout = () => {
  // Remove token and user data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Optional: Call server logout endpoint
  fetch('http://localhost:5000/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Redirect to login page
  window.location.href = '/login';
};
```

### Axios Interceptor (Recommended)

For easier token management with Axios:

```javascript
import axios from 'axios';

// Add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup/helper` | Register new helper | No |
| POST | `/login/helper` | Helper login | No |
| POST | `/signup/seeker` | Register new seeker | No |
| POST | `/login/seeker` | Seeker login | No |
| POST | `/api/admin/signup` | Register new admin | No |
| POST | `/api/admin/login` | Admin login | No |
| POST | `/logout` | Logout (client-side mainly) | No |

### Protected Routes

All routes using these middleware require JWT token:
- `isAuthenticated` - Any logged-in user
- `isAdmin` - Admin role required
- `isHelper` - Helper role required
- `isSeeker` - Seeker role required
- `isHelperOrAdmin` - Helper or Admin role required

## Middleware Usage

In your route files, protect routes like this:

```javascript
import { isSeeker, isAdmin, isAuthenticated } from '../middleware/authMiddleware.js';

// Only seekers can access
router.get('/profile', isSeeker, getSeekerProfile);

// Only admins can access
router.get('/dashboard', isAdmin, getAdminDashboard);

// Any authenticated user can access
router.get('/home', isAuthenticated, getHome);
```

## Security Best Practices

1. **Keep JWT_SECRET secure** - Never commit it to version control
2. **Use HTTPS in production** - JWT tokens should only be transmitted over HTTPS
3. **Set reasonable token expiration** - Default is 7 days
4. **Validate input** - All user inputs are validated before processing
5. **Use bcrypt for passwords** - All passwords are hashed with bcrypt (10 salt rounds)

## Troubleshooting

### "Invalid or expired token" Error
- Check if the token is being sent in the Authorization header
- Verify the token format: `Bearer <token>`
- Check if the token has expired (default: 7 days)
- Ensure JWT_SECRET in .env matches the one used to generate the token

### "Authentication required" Error
- Ensure the token is stored in localStorage
- Check if the Authorization header is being sent with requests
- Verify the token hasn't been removed from localStorage

### Password Login Fails
- If you have existing users with unhashed passwords in the database, you'll need to update them
- For development, you can delete old users and create new ones
- For production, write a migration script to hash existing passwords

## Migration from Session to JWT

If you have existing users with unhashed passwords:

1. **Option 1**: Delete all existing users and re-register (development only)
2. **Option 2**: Run a migration script:

```javascript
// migration.js
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function migratePasswords() {
  const users = await User.find();
  
  for (const user of users) {
    // Only hash if password is not already hashed
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
      await user.save();
    }
  }
  
  console.log('Migration complete');
}

migratePasswords();
```

## Testing

Test the authentication flow:

### 1. Test Signup
```bash
curl -X POST http://localhost:5000/signup/seeker \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","confirmPassword":"password123","mobilenumber":"1234567890","address":"Test Address"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:5000/login/seeker \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test Protected Route
```bash
curl http://localhost:5000/api/seeker/profile \
  -H "Authorization: Bearer <your-token-here>"
```

## Support

For issues or questions, refer to:
- JWT documentation: https://jwt.io/
- bcryptjs documentation: https://www.npmjs.com/package/bcryptjs
