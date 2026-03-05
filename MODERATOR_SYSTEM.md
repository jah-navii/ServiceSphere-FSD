# Moderator System Documentation

## Overview
The moderator system enables location-based management of ServiceSphere. Each moderator manages exactly one location, handling helper applications, bookings, and services within their assigned area.

## System Architecture

### Role Hierarchy
1. **Administrator** - Platform owner with full control
   - Approves moderator applications
   - Assigns moderators to locations
   - Manages all platform data
   - Can suspend moderators
   - Has temporary location management capabilities

2. **Moderator** - Location manager with scoped access
   - Manages one assigned location
   - Approves/rejects helper applications in their location
   - Views bookings and services in their location
   - Cannot access data from other locations

3. **Helper/Seeker** - Service providers and customers

### Location Assignment Rules
- **One moderator per location** - Each location can have only one active moderator
- **Exclusive assignment** - A moderator can only be assigned to one location
- **Pending state** - Locations without moderators have status 'pending_moderator'
- **Active state** - Locations with assigned moderators have status 'active'

## Backend Implementation

### Models

#### Admin Model (`server/models/Admin.js`)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  phone: String (required),
  role: String (enum: ['moderator', 'administrator'], default: 'moderator'),
  assignedLocation: ObjectId (ref: 'Location', required for moderators),
  status: String (enum: ['pending', 'active', 'suspended', 'rejected'], default: 'pending'),
  approvedBy: ObjectId (ref: 'Admin'),
  approvedDate: Date,
  rejectionReason: String,
  timestamps: true
}
```

#### Location Model (`server/models/Location.js`)
```javascript
{
  name: String (required),
  city: String,
  state: String,
  moderator: ObjectId (ref: 'Admin'),
  status: String (enum: ['active', 'inactive', 'pending_moderator'], default: 'pending_moderator'),
  timestamps: true
}
```

### Controllers

#### Moderator Controller (`server/controllers/moderatorController.js`)

**Public Endpoints:**
- `applyModerator(req, res)` - POST /apply/moderator
  - Creates moderator application
  - Validates location availability (one moderator per location)
  - Sets status to 'pending' for administrator review
  - Hashes password with bcrypt

- `loginModerator(req, res)` - POST /login/moderator
  - Validates credentials
  - Checks moderator status (must be 'active')
  - Populates assigned location data
  - Returns JWT token and moderator info

**Protected Endpoints (require isModerator middleware):**
- `getModeratorDashboard(req, res)` - GET /api/moderator/dashboard
  - Returns location-scoped statistics:
    - Pending helpers count
    - Active helpers count
    - Today's bookings count
    - Total services count
  - Returns assigned location details

- `getLocationHelpers(req, res)` - GET /api/moderator/helpers
  - Returns all helpers in moderator's location
  - Filters by assignedLocation field

- `approveHelper(req, res)` - PATCH /api/moderator/helpers/:id/approve
  - Approves pending helper application
  - Updates status to 'active'
  - Records approvedBy and approvedDate

- `rejectHelper(req, res)` - PATCH /api/moderator/helpers/:id/reject
  - Rejects pending helper application
  - Updates status to 'rejected'
  - Records rejection reason

- `getLocationBookings(req, res)` - GET /api/moderator/bookings
  - Returns all bookings where helper belongs to moderator's location
  - Populates seeker, helper, and service details

- `getLocationServices(req, res)` - GET /api/moderator/services
  - Returns all services available in moderator's location
  - Populates category details

#### Administrator Controller (`server/controllers/administratorController.js`)

**Moderator Management Endpoints:**
- `getModeratorApplications(req, res)` - GET /api/administrator/moderator-applications
  - Query params: ?status=pending|active|rejected
  - Returns moderator applications with statistics
  - Populates desired location details

- `approveModerator(req, res)` - PATCH /api/administrator/moderator-applications/:id/approve
  - Body: { locationId: ObjectId }
  - Validates location has no existing moderator
  - Updates moderator status to 'active'
  - Assigns moderator to location
  - Updates location's moderator field and status

- `rejectModerator(req, res)` - PATCH /api/administrator/moderator-applications/:id/reject
  - Body: { rejectionReason: String }
  - Updates moderator status to 'rejected'
  - Stores rejection reason

- `suspendModerator(req, res)` - PATCH /api/administrator/moderators/:id/suspend
  - Body: { suspensionReason: String }
  - Updates moderator status to 'suspended'
  - Removes moderator from assigned location
  - Updates location status to 'pending_moderator'

- `getLocationsWithModerators(req, res)` - GET /api/administrator/locations-with-moderators
  - Returns all locations with moderator assignment status
  - Populates moderator details where assigned

- `assignModeratorToLocation(req, res)` - PATCH /api/administrator/locations/:locationId/assign-moderator
  - Body: { moderatorId: ObjectId }
  - Validates moderator is active and not already assigned
  - Validates location has no existing moderator
  - Creates bidirectional assignment

### Routes

#### Moderator Routes (`server/routes/moderatorRoutes.js`)
```javascript
// Public routes
POST /apply/moderator - Create moderator application
POST /login/moderator - Moderator login

// Protected routes (require isModerator middleware)
GET  /api/moderator/dashboard - Dashboard statistics
GET  /api/moderator/helpers - Get all helpers in location
PATCH /api/moderator/helpers/:id/approve - Approve helper
PATCH /api/moderator/helpers/:id/reject - Reject helper
GET  /api/moderator/bookings - Get all bookings in location
GET  /api/moderator/services - Get all services in location
```

#### Administrator Routes (`server/routes/administratorRoutes.js`)
```javascript
// Moderator management routes (require isAdministrator middleware)
GET   /api/administrator/moderator-applications - Get applications (filter by status)
PATCH /api/administrator/moderator-applications/:id/approve - Approve moderator
PATCH /api/administrator/moderator-applications/:id/reject - Reject moderator
PATCH /api/administrator/moderators/:id/suspend - Suspend moderator
GET   /api/administrator/locations-with-moderators - Get location assignments
PATCH /api/administrator/locations/:locationId/assign-moderator - Manual assignment
```

### Middleware (`server/middleware/authMiddleware.js`)

**isModerator Middleware:**
- Verifies JWT token
- Checks decoded.role === 'moderator'
- Attaches user object to req with locationId
- Returns 401 if unauthenticated or wrong role
- Redirects to /login/moderator on failure

## Frontend Implementation

### Pages

#### Apply Moderator (`client/src/pages/ApplyModerator/`)
- **ApplyModerator.jsx** - Public application form
  - Fields: name, email, phone, desiredLocation (dropdown), password, confirmPassword
  - Fetches locations from API on mount
  - Validates password match and minimum 6 characters
  - POST to /apply/moderator
  - Shows success/error messages
  - Auto-redirects to home after 2 seconds on success

- **ApplyModerator.module.css** - Professional styling with gradient background

#### Login Moderator (`client/src/pages/LoginModerator/`)
- **LoginModerator.jsx** - Moderator login form
  - Fields: email, password
  - POST to /login/moderator
  - Stores token and user data in localStorage (not Redux)
  - Redirects to /moderator/dashboard on success
  - Displays server error messages

- **LoginModerator.module.css** - Matching professional styling

### Components

#### ModeratorDashboard (`client/src/components/ModeratorDashboard/`)

**ModeratorLayout.jsx**
- Wrapper component with sidebar and header
- Displays location name and moderator badge in header
- Uses React Router Outlet for nested routes
- Reads user data from localStorage

**ModeratorLayout.module.css**
- Flexbox layout with sidebar and main content area
- Header with location info and user badge
- Responsive padding and overflow handling

**ModeratorSidebar.jsx**
- Navigation sidebar with 4 menu items:
  - Dashboard
  - Helper Applications
  - Bookings
  - Services
- Logout button at bottom
- Uses NavLink with active state styling
- Collapses on mobile (shows icons only)

**ModeratorSidebar.module.css**
- Dark gradient background (#2d3748 to #1a202c)
- Active state with purple accent (#667eea)
- Hover effects and transitions
- Mobile responsive icon-only mode

**ModeratorHome.jsx**
- Dashboard overview page
- Fetches GET /api/moderator/dashboard
- Displays 4 stat cards:
  - Pending Helpers
  - Active Helpers
  - Today's Bookings
  - Active Services
- Shows location information (city, state, status)
- Alert banner when pending helpers exist

**ModeratorHome.module.css**
- Grid layout for stat cards
- Hover animations on cards
- Color-coded status badges
- Warning alert styling

**ModeratorHelpers.jsx**
- Helper application management page
- Fetches GET /api/moderator/helpers
- Groups helpers by status (pending, active, rejected)
- Shows helper details: name, email, phone, service, applied date
- Approve button → PATCH /api/moderator/helpers/:id/approve
- Reject button → prompts for reason → PATCH /api/moderator/helpers/:id/reject
- Auto-refreshes list after actions
- Loading states during approve/reject operations

**ModeratorHelpers.module.css**
- Card grid layout for helper applications
- Color-coded status badges (pending yellow, active green, rejected red)
- Gradient card headers
- Action buttons with hover effects

**ModeratorBookings.jsx**
- Bookings list page
- Fetches GET /api/moderator/bookings
- Displays table with columns:
  - Booking ID (truncated)
  - Seeker name
  - Helper name
  - Service name
  - Date
  - Status (badge)
  - Amount
- Compact table view for data density

**ModeratorBookings.module.css**
- Table styling with gradient header
- Hover effects on rows
- Status badge colors (pending, confirmed, in_progress, completed, cancelled)
- Responsive with horizontal scroll on mobile

**ModeratorServices.jsx**
- Services list page
- Fetches GET /api/moderator/services
- Displays service cards with:
  - Service name
  - Price
  - Description
  - Category badge
  - Location name
- Card grid layout

**ModeratorServices.module.css**
- Card grid with hover effects
- Gradient card headers
- Price badge in card header
- Category and location info styling

### Routing Configuration (`client/src/App.js`)

**Imports Added:**
```javascript
import ModeratorLayout from "./components/ModeratorDashboard/ModeratorLayout";
import ModeratorHome from "./components/ModeratorDashboard/ModeratorHome";
import ModeratorHelpers from "./components/ModeratorDashboard/ModeratorHelpers";
import ModeratorBookings from "./components/ModeratorDashboard/ModeratorBookings";
import ModeratorServices from "./components/ModeratorDashboard/ModeratorServices";
import ApplyModerator from "./pages/ApplyModerator/ApplyModerator";
import LoginModerator from "./pages/LoginModerator/LoginModerator";
```

**Public Routes:**
```javascript
<Route path="/login/moderator" element={<LoginModerator />} />
<Route path="/apply/moderator" element={<ApplyModerator />} />
```

**Protected Routes:**
```javascript
<Route path="/moderator" element={
  <ProtectedRoute redirectTo="/login/moderator" requireModerator={true}>
    <ModeratorLayout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<ModeratorHome />} />
  <Route path="helpers" element={<ModeratorHelpers />} />
  <Route path="bookings" element={<ModeratorBookings />} />
  <Route path="services" element={<ModeratorServices />} />
</Route>
```

### Protected Route Enhancement (`client/src/components/ProtectedRoute.jsx`)

**New Props:**
- `requireModerator` - Boolean flag for moderator-only routes

**Moderator Authentication Logic:**
- Checks localStorage for token and user (moderators don't use Redux)
- Verifies user.role === 'moderator'
- Redirects to /login/moderator if unauthenticated
- Redirects to /unauthorized if wrong role
- Returns early before Redux authentication checks

## Complete User Workflow

### Moderator Application Flow
1. User visits `/apply/moderator` (public page)
2. Fills out application form with desired location
3. System validates location has no existing moderator
4. Application created with status 'pending'
5. User waits for administrator approval

### Administrator Approval Flow
1. Administrator logs in to `/administrator/dashboard`
2. Navigates to moderator management page
3. Views pending applications
4. Reviews application details and desired location
5. Clicks approve and selects location (may differ from desired)
6. System updates:
   - Moderator status → 'active'
   - Moderator assignedLocation → selected location
   - Location moderator → moderator reference
   - Location status → 'active'

### Moderator Login & Dashboard Flow
1. Approved moderator visits `/login/moderator`
2. Enters credentials
3. System validates:
   - Credentials are correct
   - Status is 'active'
4. Token and user info stored in localStorage
5. Redirected to `/moderator/dashboard`
6. Dashboard displays:
   - Location name in header
   - Location-scoped statistics
   - Quick alerts for pending actions

### Helper Approval Flow (Moderator)
1. Moderator navigates to `/moderator/helpers`
2. Views pending helper applications in their location
3. Clicks approve/reject on application
4. For rejection, enters reason in prompt
5. System updates helper status
6. List auto-refreshes

### Moderator Suspension Flow (Administrator)
1. Administrator finds moderator to suspend
2. Clicks suspend and enters reason
3. System updates:
   - Moderator status → 'suspended'
   - Moderator assignedLocation → null
   - Location moderator → null
   - Location status → 'pending_moderator'
4. Moderator loses access to dashboard

## Data Scoping & Security

### Location-Based Access Control
- **Moderators** see only data from their assigned location:
  - Helpers filtered by `helper.assignedLocation === moderator.assignedLocation`
  - Bookings filtered by `booking.helper.assignedLocation === moderator.assignedLocation`
  - Services filtered by `service.location === moderator.assignedLocation`

### Backend Validation
- All moderator endpoints validate `req.user.locationId` exists
- Database queries include location filter
- Prevents cross-location data access

### Frontend Security
- Moderators use localStorage (separate from Redux state)
- ProtectedRoute validates moderator role before rendering
- Token sent in Authorization header for all API calls

## Scalability Considerations

### Multi-City Support
- System supports unlimited locations
- Each location independently managed
- No cross-location dependencies
- Administrator can manage temporary gaps

### Application Queue
- Multiple moderators can apply for same location
- Only one can be approved at a time
- Others remain 'pending' or can be rejected
- Administrator can reassign if needed

### Performance Optimization
- Location-scoped queries reduce data volume
- Indexed fields: role, status, assignedLocation
- Pagination can be added for large datasets

## API Testing Checklist

### Moderator Application
```bash
# Apply as moderator
POST http://localhost:5000/apply/moderator
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "desiredLocation": "<location_id>",
  "password": "password123"
}
```

### Moderator Login
```bash
# Login as moderator
POST http://localhost:5000/login/moderator
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Moderator Dashboard
```bash
# Get dashboard data
GET http://localhost:5000/api/moderator/dashboard
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Administrator Approval
```bash
# Approve moderator
PATCH http://localhost:5000/api/administrator/moderator-applications/<moderator_id>/approve
Headers: {
  "Authorization": "Bearer <admin_token>"
}
Body: {
  "locationId": "<location_id>"
}
```

## Files Created/Modified

### Backend Files
- ✅ `server/models/Admin.js` - Updated with moderator role and fields
- ✅ `server/models/Location.js` - Updated with moderator reference
- ✅ `server/controllers/moderatorController.js` - NEW (8 functions)
- ✅ `server/controllers/administratorController.js` - Extended (6 new functions)
- ✅ `server/routes/moderatorRoutes.js` - NEW
- ✅ `server/routes/administratorRoutes.js` - Extended
- ✅ `server/middleware/authMiddleware.js` - Added isModerator
- ✅ `server/index.js` - Registered moderator routes

### Frontend Files
- ✅ `client/src/pages/ApplyModerator/ApplyModerator.jsx` - NEW
- ✅ `client/src/pages/ApplyModerator/ApplyModerator.module.css` - NEW
- ✅ `client/src/pages/LoginModerator/LoginModerator.jsx` - NEW
- ✅ `client/src/pages/LoginModerator/LoginModerator.module.css` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorLayout.jsx` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorLayout.module.css` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorSidebar.jsx` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorSidebar.module.css` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorHome.jsx` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorHome.module.css` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorHelpers.jsx` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorHelpers.module.css` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorBookings.jsx` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorBookings.module.css` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorServices.jsx` - NEW
- ✅ `client/src/components/ModeratorDashboard/ModeratorServices.module.css` - NEW
- ✅ `client/src/components/ProtectedRoute.jsx` - Updated with requireModerator
- ✅ `client/src/App.js` - Added moderator routes

**Total: 21 files created/modified**

## Next Steps

### Administrator UI Development
Create frontend pages for administrator to manage moderators:
1. Moderator applications list page
2. Moderator approval interface  
3. Location assignment interface
4. Moderator suspension interface
5. Location-moderator mapping dashboard

### Additional Features
- Email notifications for moderator approval/rejection
- Moderator activity logs
- Performance metrics for moderators
- Moderator-to-administrator messaging
- Location switching (if administrator assigns to new location)

### Testing
- Complete end-to-end workflow testing
- API endpoint testing with Postman
- Frontend component testing
- Role-based access control validation
- Location scoping verification

## Notes
- Moderators authenticate separately from Redux (localStorage only)
- One moderator per location is enforced at application approval
- Administrators can temporarily manage any location
- System designed for scalability to 100+ cities
- No emojis in production code per requirements
