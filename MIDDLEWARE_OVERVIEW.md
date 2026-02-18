# Middleware Overview

This document provides a comprehensive overview of all middleware implementations in the ServiceSphere application.

---

## 1. Authentication Middleware

**File:** `server/middleware/authMiddleware.js`

### isAuthenticated
- **Purpose:** Verifies any user is logged in regardless of role
- **How it works:** Checks if `req.session.user` exists
- **Response:** Returns 401 with redirect to `/login` if not authenticated
- **Demo:** Try accessing a protected route without logging in

### isAdmin
- **Purpose:** Restricts access to admin-only routes
- **How it works:** Checks if `req.session.user.role === 'admin'`
- **Response:** Returns 403 for API calls or redirects to `/login/admin`
- **Demo:** Try accessing admin dashboard without admin login

### isHelper
- **Purpose:** Restricts access to helper-only routes
- **How it works:** Checks if `req.session.user.role === 'helper'`
- **Response:** Returns 403 for API calls or redirects to `/login/helper`
- **Demo:** Try accessing helper profile without helper login

### isSeeker
- **Purpose:** Restricts access to seeker-only routes
- **How it works:** Checks if `req.session.user.role === 'seeker'`
- **Response:** Returns 403 for API calls or redirects to `/login/seeker`
- **Demo:** Try accessing booking form without seeker login

### isHelperOrAdmin
- **Purpose:** Allows both helpers and admins to access certain routes
- **How it works:** Checks if role is either 'helper' or 'admin'
- **Response:** Returns 403 if neither role matches
- **Demo:** Access helper management routes as admin or helper

### redirectIfAuthenticated
- **Purpose:** Prevents authenticated users from accessing login/signup pages
- **How it works:** Redirects based on user role if already logged in
- **Response:** Redirects admin to dashboard, helper to profile, seeker to home
- **Demo:** Login, then try visiting `/login` again

---

## 2. Custom Middleware

**File:** `server/middleware/customMiddleware.js`

### requestLogger
- **Purpose:** Logs all incoming HTTP requests
- **How it works:** Logs timestamp, HTTP method, URL, and IP address to console
- **Used in:** Application-level in `server/index.js` (line 43)
- **Demo:** Make any request and check server console for log entry
- **Example Output:** `[2026-02-18T10:30:45.123Z] GET /api/services - IP: ::1`

### requestTimer
- **Purpose:** Measures and logs request processing time
- **How it works:** Records start time, calculates duration when response finishes
- **Used in:** Application-level in `server/index.js` (line 46)
- **Demo:** Make any request and check console for timing log
- **Example Output:** `[TIMING] GET /api/services - 245ms`

### asyncHandler
- **Purpose:** Wraps async route handlers to catch errors automatically
- **How it works:** Wraps function in Promise.resolve() and catches errors
- **Usage:** Wrap async route handlers to avoid try-catch blocks
- **Demo:** Use in route handler with async operations

### notFoundHandler
- **Purpose:** Handles 404 errors for undefined routes
- **How it works:** Creates error with 404 status for non-existent routes
- **Used in:** `server/index.js` (line 144) before error handler
- **Demo:** Access non-existent route like `http://localhost:5000/api/does-not-exist`

### bookingRateLimiter
- **Purpose:** Prevents booking spam by limiting requests
- **How it works:** 
  - Limits seekers to 2 bookings per 15 minutes
  - Uses `express-rate-limit` package
  - Tracks by seeker ID (user-specific)
  - Skips rate limiting for non-seekers (admin/helper)
- **Used in:** `server/routes/bookingRoutes.js` (line 10)
- **Configuration:**
  - Window: 15 minutes
  - Max requests: 2 bookings
  - Status code: 429 (Too Many Requests)
- **Demo:** 
  1. Login as seeker
  2. Create 2 bookings quickly
  3. Try creating a 3rd booking - should get 429 error with message
  4. Wait 15 minutes or use different seeker account to reset

---

## 3. Error Handler

**File:** `server/middleware/errorHandler.js`

### errorHandler
- **Purpose:** Centralized error handling for the entire application
- **How it works:** 
  - Catches all errors passed via `next(err)`
  - Logs comprehensive error details to console
  - Returns formatted JSON response
  - Includes stack trace in development mode only
- **Used in:** Last middleware in `server/index.js` (line 147)
- **Logged Information:**
  - Error message
  - Stack trace
  - Request URL
  - HTTP method
  - Timestamp
- **Response Format:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Error description",
      "status": 500,
      "stack": "..." // Only in development
    }
  }
  ```
- **Demo:**
  1. Trigger an error in any route (e.g., database error, validation error)
  2. Check response for formatted JSON error
  3. Check server console for logged error details

---

## 4. Third-Party Middleware

**File:** `server/index.js`

### helmet
- **Location:** Line 33
- **Purpose:** Sets security-related HTTP headers to protect against common vulnerabilities
- **Configuration:** CSP disabled for frontend compatibility
- **Demo:** Inspect response headers in browser DevTools (Network tab)

### morgan
- **Location:** Line 37
- **Purpose:** HTTP request logger with predefined formats
- **Format:** 'dev' (colored output for development)
- **Demo:** Make requests and see standardized logs in console

### cors
- **Location:** Line 48
- **Purpose:** Enables cross-origin requests from React frontend
- **Configuration:**
  - Origin: `http://localhost:5173` (React dev server)
  - Credentials: true (allows cookies/sessions)
- **Demo:** Frontend can make API calls without CORS errors

### express-session
- **Location:** Line 69
- **Purpose:** Manages user sessions and authentication state
- **Configuration:**
  - Secret: From environment variable or fallback
  - resave: false
  - saveUninitialized: true
- **Demo:** Login and session persists across requests

### express.json()
- **Location:** Line 63
- **Purpose:** Parses incoming JSON request bodies
- **Demo:** Send POST request with JSON data

### express.urlencoded()
- **Location:** Line 64
- **Purpose:** Parses URL-encoded form data
- **Configuration:** extended: true
- **Demo:** Submit HTML form with form data

### express.static()
- **Locations:** Lines 67, 77, 84, 90
- **Purpose:** Serves static files (uploads, CSS, JS, images)
- **Paths:**
  - `/uploads` - User uploaded files
  - `/styles` - CSS files
  - `/javascript` - JavaScript files
  - `/pics` - Image files

---

## Middleware Execution Order

The order of middleware in Express is critical. Here's the execution flow:

1. **Security** - helmet
2. **Logging** - morgan, requestLogger, requestTimer
3. **CORS** - cors
4. **Parsing** - express.json(), express.urlencoded()
5. **Static Files** - express.static()
6. **Session** - express-session
7. **Routes** - All route handlers (with route-level middleware)
8. **404 Handler** - notFoundHandler
9. **Error Handler** - errorHandler (must be last)

---

## Quick Demo Guide

### Test Authentication Middleware
```bash
# Scenario 1: Unauthorized access
1. Access http://localhost:5000/admin/dashboard without login
   Expected: 403 Forbidden or redirect to login

# Scenario 2: Wrong role access
2. Login as seeker
3. Try accessing http://localhost:5000/admin/dashboard
   Expected: 403 Forbidden with "Admin access required"

# Scenario 3: Correct access
4. Login as admin
5. Access http://localhost:5000/admin/dashboard
   Expected: Success
```

### Test Rate Limiting
```bash
# Test booking rate limiter
1. Login as seeker in the application
2. Create first booking → Success
3. Create second booking immediately → Success
4. Create third booking → 429 Error "too many bookings"
5. Error message shows: "Please try again after 15 minutes"
6. Wait 15 minutes or use different seeker to reset counter
```

### Test Error Handler
```bash
# Test 404 handler
1. Navigate to http://localhost:5000/api/nonexistent
   Expected: 404 JSON response with "Route not found"

# Test general error handling
2. Trigger a database error or validation error in any route
   Expected: Appropriate status code with formatted error JSON
   
# Check console
3. View server console for detailed error logs with timestamps
```

### Test Request Logging
```bash
# Make any API request
1. Open browser and navigate to http://localhost:5000/api/services
2. Check server console output

Expected logs:
- [2026-02-18T10:30:45.123Z] GET /api/services - IP: ::1
- GET /api/services 200 245ms (morgan format)
- [TIMING] GET /api/services - 245ms
```

---

## Route-Level Middleware Usage

### Example from Routes

**Admin Routes** (`server/routes/adminRoutes.js`)
```javascript
router.get('/admin/dashboard', isAdmin, getAdminDashboard);
```

**Booking Routes** (`server/routes/bookingRoutes.js`)
```javascript
router.post('/', bookingRateLimiter, createBooking);
```

**Seeker Routes** (`server/routes/seekerRoutes.js`)
```javascript
router.get('/profile', isSeekerLoggedIn, getSeekerProfile);
```

---

## Testing Checklist

- [ ] Test isAuthenticated with logged in and logged out users
- [ ] Test isAdmin with admin, helper, and seeker accounts
- [ ] Test isHelper with different user roles
- [ ] Test isSeeker with different user roles
- [ ] Test redirectIfAuthenticated after login
- [ ] Test bookingRateLimiter by making multiple bookings
- [ ] Test request logging by making various requests
- [ ] Test 404 handler with invalid routes
- [ ] Test error handler with intentional errors
- [ ] Verify CORS allows frontend requests
- [ ] Verify session persistence across requests

---

## Notes

- All authentication middleware includes debug logging in development
- Rate limiting is user-specific (by seeker ID) not IP-based
- Error handler includes stack traces only in development mode
- All middleware follows Express standard signatures
- Session-based authentication is used throughout the application
