# Middleware Implementation Guide

## 1. APPLICATION-LEVEL MIDDLEWARE
Applied globally to all requests using `app.use()` in `server/index.js`.

### **helmet** (Third-party)
```javascript
app.use(helmet({ contentSecurityPolicy: false }));
```
**Effect:** Adds security headers to every HTTP response (X-Frame-Options, X-XSS-Protection, etc.). Check with `curl -I http://localhost:5000/home`.

### **morgan** (Third-party)
```javascript
app.use(morgan('dev'));
```
**Effect:** Logs every HTTP request in terminal: `GET /home 200 45.123 ms - 1234`. Shows method, URL, status, time, and size.

### **requestLogger** (Custom)
```javascript
app.use(requestLogger);
```
**Effect:** Console logs `[2026-02-06T10:30:45.123Z] GET /home - IP: ::1` for every request with timestamp and client IP.

### **requestTimer** (Custom)
```javascript
app.use(requestTimer);
```
**Effect:** Tracks request duration and logs `[TIMING] GET /home - 45ms` when response finishes. Useful for performance monitoring.

### **cors** (Third-party)
```javascript
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
```
**Effect:** Allows React frontend (port 5173) to make API calls. Without this, browser blocks cross-origin requests.

### **express.json()** (Built-in)
```javascript
app.use(express.json());
```
**Effect:** Parses JSON request bodies. Allows `req.body` to access `{"name": "John"}` from POST/PUT requests.

### **express.static()** (Built-in)
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
**Effect:** Serves files from `/uploads` folder. Access uploaded images at `http://localhost:5000/uploads/image.jpg`.

### **express-session** (Third-party)
```javascript
app.use(session({ secret: 'key', resave: false, saveUninitialized: true }));
```
**Effect:** Creates `req.session` object to store user login data. Persists across requests using cookies.

---

## 2. ROUTER-LEVEL MIDDLEWARE
Applied to specific routes or route groups.

### **multer** (Third-party) - `routes/helperRoutes.js`
```javascript
const upload = multer({ storage: multer.diskStorage({...}) });
router.put('/profile', upload.single('certifications'), updateHelperProfile);
```
**Effect:** Handles file uploads from helper profile form. Saves files to `uploads/` folder and adds `req.file` object.

### **isAdmin** (Custom) - `routes/adminRoutes.js`
```javascript
function isAdmin(req, res, next) {
  if (req.session.user?.role === 'admin') return next();
  res.redirect('/login/admin');
}
router.get('/api/admin/messages', isAdmin, getContactMessages);
```
**Effect:** Blocks non-admin users from accessing admin routes. Redirects to login if session doesn't have admin role.

### **isSeekerLoggedIn** (Custom) - `routes/seekerRoutes.js`
```javascript
function isSeekerLoggedIn(req, res, next) {
  if (req.session.user?.role === 'seeker') return next();
  return res.redirect('/login/seeker');
}
router.get('/profile', isSeekerLoggedIn, getSeekerProfile);
```
**Effect:** Protects seeker profile routes. Only logged-in seekers can access their profile page.

---

## 3. BUILT-IN MIDDLEWARE
Native Express functions (no installation needed).

- **express.json()** - Parses JSON bodies → `req.body` available
- **express.urlencoded()** - Parses form data → handles `<form>` submissions
- **express.static()** - Serves static files → CSS, JS, images accessible via URL

---

## 4. THIRD-PARTY MIDDLEWARE
External npm packages installed via `npm install`.

- **helmet** - Adds 11 security headers automatically
- **morgan** - HTTP request logger with timestamps
- **cors** - Enables cross-origin requests from React app
- **express-session** - Session management with cookies
- **multer** - File upload handling

---

## 5. ERROR-HANDLING MIDDLEWARE
Special signature: `(err, req, res, next)` - must be defined **last** in `server/index.js`.

### **errorHandler** - `middleware/errorHandler.js`
```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', { message: err.message, url: req.originalUrl });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { message: err.message, status: err.statusCode || 500 }
  });
};
app.use(errorHandler);
```
**Effect:** Catches all errors thrown in routes/controllers. Logs error details to console and sends JSON error response to client.

### **notFoundHandler** (Custom)
```javascript
app.use(notFoundHandler);
```
**Effect:** Catches requests to undefined routes (e.g., `/invalid-page`) and returns `404` error before error handler processes it.

---

## 6. CUSTOM MIDDLEWARE
User-defined functions for specific needs - defined in `middleware/customMiddleware.js`.

### **asyncHandler**
```javascript
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```
**Effect:** Wraps async route handlers to automatically catch errors. Use: `router.get('/data', asyncHandler(async (req, res) => {...}))`.

---

## Middleware Execution Order in `server/index.js`

```javascript
// Security first
app.use(helmet());

// Logging
app.use(morgan('dev'));
app.use(requestLogger);
app.use(requestTimer);

// CORS & Parsing
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Static files & Session
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({...}));

// Routes
app.use('/', authRoutes);
app.use('/', helperRoutes);
app.use('/api/bookings', bookingRoutes);
// ... more routes

// 404 handler
app.use(notFoundHandler);

// Error handler (MUST BE LAST)
app.use(errorHandler);
```

**Why this order matters:**
1. **Security** first - helmet protects before anything else
2. **Logging** early - capture all requests including errors
3. **CORS/Parsing** - prepare request data before routes
4. **Routes** - handle business logic
5. **404** - catch undefined routes
6. **Error handler** last - catches all errors from above

---

## Testing the Middleware

**Start server:**
```bash
cd server
npm start
```

**Test logging (morgan + requestLogger):**
```bash
curl http://localhost:5000/home
```
**Console shows:**
```
[2026-02-06T10:30:45.123Z] GET /home - IP: ::1
GET /home 200 45.123 ms - 1234
[TIMING] GET /home - 45ms
```

**Test helmet (security headers):**
```bash
curl -I http://localhost:5000/home
```
**Response includes:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
```

**Test error handler:**
```bash
curl http://localhost:5000/invalid-route
```
**Returns JSON:**
```json
{
  "success": false,
  "error": {
    "message": "Route not found - /invalid-route",
    "status": 404
  }
}
```

---

## Files Created/Modified

**New Files:**
- `server/middleware/errorHandler.js` - Centralized error handling
- `server/middleware/customMiddleware.js` - Custom middleware collection

**Modified:**
- `server/index.js` - Integrated all middleware

**Installed:**
```bash
npm install helmet morgan
```
