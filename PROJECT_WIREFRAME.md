# ServiceSphere - Complete Project Wireframe

## Project Overview
ServiceSphere is a comprehensive service marketplace platform connecting service seekers with service providers (helpers), managed by administrators and location-based moderators.

---

## 🏗️ System Architecture

### **Tech Stack**
- **Frontend:** React.js with React Router, CSS Modules
- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Charts:** Chart.js with react-chartjs-2
- **Payment Processing:** Razorpay integration

---

## 👥 User Roles & Access Levels

### 1. **Service Seeker (Customer)**
- Browse and search services by location and category
- Add services to cart
- Book services with helpers
- Make payments
- View booking history
- Provide feedback and ratings
- Manage profile

### 2. **Service Helper (Provider)**
- Register with specific category and services
- Upload certifications
- Receive and manage service requests
- View schedule and bookings
- Track earnings
- View customer feedback
- Update availability and profile

### 3. **Administrator (Super Admin)**
- Manage all users (seekers, helpers, moderators)
- Oversee all bookings platform-wide
- Manage service categories and services
- Manage locations and assign moderators
- View all feedback
- Access comprehensive analytics and earnings data
- Approve/reject moderator applications
- Handle contact messages

### 4. **Moderator (Location Manager)**
- Manage helpers in assigned location
- Approve/reject helper applications in their location
- View location-specific bookings
- Access location-specific earnings analytics
- View platform services
- Manage profile

---

## 📱 Application Flow & Pages

### **Public Routes**

#### Landing Page (`/`)
- Hero section with platform introduction
- Features showcase
- Service categories browse range
- Popular services section
- Call-to-action buttons (Sign Up, Login)
- Footer with links

#### Signup Selection (`/signup`)
- Choose user type:
  - Service Seeker
  - Service Helper
  - Administrator

#### Login Selection (`/login`)
- Choose user type to login:
  - Service Seeker
  - Service Helper
  - Administrator
  - Moderator

#### Individual Signup Pages
- **Seeker Signup** (`/signup/seeker`)
  - Name, Email, Password, Mobile, Address
  
- **Helper Signup** (`/signup/helper`)
  - Name, Email, Password, Mobile, Aadhar Number
  - Gender, Address, Location selection
  - Category selection (single category)
  - Services selection from chosen category
  - Service pricing
  - Availability
  - Certifications upload (multiple files)
  
- **Admin Signup** (`/signup/admin`)
  - Name, Email, Password, Phone
  - Auto-assigned role: administrator

#### Individual Login Pages
- **Seeker Login** (`/login/seeker`)
- **Helper Login** (`/login/helper`)
- **Admin Login** (`/login/admin`)
- **Moderator Login** (`/login/moderator`)

#### Moderator Application (`/apply/moderator`)
- Name, Email, Password, Phone
- Desired location selection
- Submitted for administrator approval

#### Additional Public Pages
- **About Us** (`/about`) - Company information
- **Contact Admin** (`/AdminContact`) - Contact form for issues
- **Terms and Conditions** (`/TermsAndConditions`)

---

### **Seeker Dashboard Routes** (Protected)

#### Home Page (`/home`)
- **Header:** Search bar, location, cart icon, profile dropdown
- **Browse Categories:** Service category cards
- **Featured Services:** Recommended services
- **Footer:** Links and info

#### Search Page (`/search`)
- Service search by location and category
- Filter by:
  - Location
  - Category
  - Price range
- Service cards with:
  - Service name
  - Helper name
  - Price
  - Rating
  - "Add to Cart" button

#### Cart Page (`/cart`)
- List of selected services
- Service details with helper info
- Remove from cart option
- Total amount calculation
- Proceed to booking button

#### Booking Form (`/booking`)
- Service details
- Date and time selection
- Address confirmation
- Customer information
- Submit booking button

#### Payment Page (`/payment`)
- Razorpay payment integration
- Payment amount display
- Multiple payment methods
- Payment confirmation

#### Previous Bookings (`/previous-bookings`)
- List of all past and current bookings
- Booking details:
  - Service type
  - Helper name
  - Date, Time, Address
  - Status (Pending/Confirmed/Completed/Cancelled)
  - Price
- Submit feedback option for completed bookings

#### Seeker Profile (`/seeker-profile`)
- View and edit personal information
- Name, Email (read-only), Mobile, Address
- Update profile button

---

### **Helper Dashboard Routes** (Protected)

Layout: Sidebar navigation with main content area

#### Dashboard/Requests Page (`/helper/requests`)
- View all service requests
- Request cards showing:
  - Customer name
  - Service type
  - Date and time
  - Address
  - Status
- Accept/Reject buttons

#### Profile Page (`/helper/profile`)
- Personal information (view/edit)
- Services offered with pricing
- Availability status
- Certifications display
- Update profile option

#### Schedule Page (`/helper/schedule`)
- Calendar view of bookings
- Upcoming appointments
- Booking details
- Time management

#### Earnings Page (`/helper/earnings`)
- Total earnings display
- Earnings breakdown by service
- Payment history
- Date range filtering

#### Feedback Page (`/helper/feedback`)
- Customer reviews and ratings
- Feedback cards with:
  - Customer name
  - Rating (1-5 stars)
  - Comments
  - Date
- Average rating display

---

### **Administrator Dashboard Routes** (Protected)

Layout: Sidebar + Main Content Area

#### Dashboard Home (`/administrator/dashboard`)
- **Summary Cards:**
  - Total Users
  - Total Helpers
  - Total Bookings
  - Total Revenue
- **Recent Activity:**
  - Latest bookings
  - New user registrations
  - Pending approvals
- **Quick Actions:**
  - Approve helpers
  - Manage locations
  - View reports

#### Users Management (`/administrator/users`)
- **Tabs:**
  - **Seekers:** View all service seekers
  - **Helpers:** View all helpers with approve/reject actions
  - **Moderators:** View moderator applications, approve/reject
- **User Cards/Table:**
  - Name, Email, Phone
  - Status (Active/Pending/Suspended/Rejected)
  - Registration date
  - Actions (View, Edit, Delete, Approve, Reject)
- **Search & Filter:**
  - By name, email, status
  - Date range

#### Bookings Management (`/administrator/bookings`)
- **All Bookings Table:**
  - Booking ID
  - Seeker name
  - Helper name
  - Service type
  - Date and time
  - Status
  - Amount
  - Payment status
- **Search & Filter:**
  - By status
  - By date range
  - By location
  - By service type
- **Sort Options:**
  - By date
  - By amount
  - By status

#### Services Management (`/administrator/services`)
- **Category Management:**
  - Create new category
  - Edit/Delete categories
  - Category cards with:
    - Name, Description, Image
    - Service count
- **Service Management:**
  - Add services to categories
  - Edit/Delete services
  - Services grouped by category
  - Active/Inactive toggle
- **Display Format:**
  - Category cards with gradient headers
  - Nested service grids
  - Search functionality

#### Locations Management (`/administrator/locations`)
- **Location Cards:**
  - Location name
  - City, State
  - Assigned moderator
  - Status (Active/Pending Moderator/Inactive)
  - Helper count
- **Actions:**
  - Add new location
  - Edit location details
  - Assign moderator
  - View helpers in location
  - Delete location
- **Search & Filter:**
  - By status
  - By moderator assignment

#### Feedbacks View (`/administrator/feedbacks`)
- **All Feedback Cards:**
  - Seeker name
  - Helper name
  - Service type
  - Rating (stars)
  - Comments
  - Date
- **Filter Options:**
  - By rating
  - By helper
  - By date range
- **Statistics:**
  - Average rating
  - Total feedback count
  - Rating distribution

#### Earnings Analytics (`/administrator/earnings`)
- **Summary Cards:**
  - Total Earnings (₹)
  - Total Bookings (#)
  - Average Booking Value (₹)
  - Payment Success Rate (%)
- **Charts:**
  - **Monthly Revenue Trend:** Bar chart showing earnings by month
  - **Payment Status:** Doughnut chart (Received vs Pending)
  - **Daily Performance:** Line chart showing last 14 days
  - **Service Categories:** Doughnut chart showing revenue by category
  - **Top Performing Helpers:** Horizontal bar chart (top 5 earners)

---

### **Moderator Dashboard Routes** (Protected)

Layout: Fixed Sidebar + Main Content Area

#### Sidebar Components
- **Logo & Title:** ServiceSphere Moderator Portal
- **Location Badge:** Shows assigned location with map pin icon
- **Navigation Links:**
  - Dashboard
  - Helper Applications
  - Bookings
  - Services
  - Earnings
  - Profile
- **Logout Button**

#### Dashboard Home (`/moderator/dashboard`)
- **Summary Cards:**
  - Total Helpers in Location
  - Pending Applications
  - Total Bookings
  - Location Revenue
- **Recent Activity:**
  - Latest helper applications
  - Recent bookings
  - Status updates
- **Quick Actions:**
  - Review pending helpers
  - View today's bookings

#### Helper Applications (`/moderator/helpers`)
- **Pending Applications Tab:**
  - Helper cards with full details
  - Name, Email, Phone, Aadhar
  - Category and services
  - Pricing information
  - Certifications (image carousel)
  - Approve/Reject buttons with modal
- **Approved Helpers Tab:**
  - List of active helpers
  - Helper details
  - Performance metrics
- **Rejected Helpers Tab:**
  - List of rejected applications
  - Rejection reasons

#### Bookings Management (`/moderator/bookings`)
- **Bookings Table:**
  - Only bookings from helpers in assigned location
  - Seeker name
  - Helper name
  - Service type
  - Date, Time
  - Status
  - Price (₹)
  - Payment status
- **Search Bar:** Search by seeker/helper name
- **Status Filter:** All, Pending, Confirmed, Completed, Cancelled
- **Sort Options:**
  - Date (ascending/descending)
  - Amount (low to high / high to low)
- **Statistics:**
  - Total bookings count
  - Filtered results count

#### Services View (`/moderator/services`)
- **Platform Services Display:**
  - Shows all categories and services (platform-wide)
  - Not location-specific
- **Search Functionality:**
  - Search categories and service names
- **Display Format:**
  - Category cards with gradient headers
  - Service count per category
  - Services in grid layout
  - Status indicators (Active/Inactive)
- **Statistics:**
  - Total categories
  - Total services

#### Earnings Analytics (`/moderator/earnings`)
- **Summary Cards:**
  - Total Earnings for location (₹)
  - Total Bookings in location (#)
  - Average Booking Value (₹)
  - Payment Success Rate (%)
- **Charts:** (All filtered by location)
  - **Monthly Revenue Trend:** Bar chart
  - **Payment Status:** Doughnut chart
  - **Daily Performance:** Line chart (last 14 days)
  - **Service Categories:** Revenue by category
  - **Top Helpers:** Top 5 helpers in location
- **Note:** Currently shows sample static data for demonstration

#### Profile Management (`/moderator/profile`)
- **View Mode:**
  - Name
  - Email (read-only)
  - Phone
  - Assigned Location (read-only)
  - Status (read-only)
- **Edit Mode:**
  - Update name
  - Update phone
  - Save changes button
- **Cancel Button:** Return to view mode

---

## 🎨 Design & UI Components

### Color Scheme
- **Primary Color:** Cerulean Blue (#007ea7)
- **Secondary Color:** Light Cerulean (#00a8cc)
- **Accent Color:** Very Light Blue (#e6f7fb)
- **Success:** Green (#4caf50)
- **Warning:** Orange (#ff9800)
- **Error:** Red (#dc3545)

### Common Components
- **Navbar:** Logo, Navigation links, User menu
- **Sidebar:** Vertical navigation for dashboards
- **Cards:** Information containers with shadow and hover effects
- **Modals:** For confirmations and forms
- **Forms:** Input fields with validation
- **Buttons:** Primary, Secondary, Danger variants
- **Tables:** Responsive data tables
- **Charts:** Interactive visualizations
- **Search Bars:** With filter options
- **Badges:** Status indicators
- **Tooltips:** Additional information on hover
- **Image Carousel:** For certifications and images
- **Dropdown Menus:** For filters and actions

### Responsive Design
- **Desktop:** Full layout with sidebar
- **Tablet:** Collapsed sidebar, responsive grids
- **Mobile:** Hamburger menu, single column layout

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers with role-specific form
2. Password is hashed using bcrypt (10 salt rounds)
3. User logs in with email and password
4. JWT token is generated and sent to client
5. Token stored in localStorage
6. Token sent in Authorization header for protected routes

### Authorization Middleware
- **isModerator:** Verifies moderator role
- **requireAdministrator:** Verifies administrator role
- **allowedRoles:** Checks if user has required role
- Token validation on every protected request

### Token Storage
- **Seeker/Helper/Admin:** `localStorage.setItem('token', token)`
- **User Data:** `localStorage.setItem('user', JSON.stringify(userData))`

---

## 📊 Data Relationships

### Key Relationships
- **Helper → Location:** Many-to-One (Helper belongs to one Location)
- **Helper → Category:** Many-to-One (Helper offers services in one Category)
- **Helper → Services:** One-to-Many (Helper offers multiple Services from their Category)
- **Booking → Helper:** Many-to-One
- **Booking → Seeker:** Many-to-One
- **Feedback → Helper:** Many-to-One
- **Feedback → Seeker:** Many-to-One
- **Service → Category:** Many-to-One
- **Location → Moderator (Admin):** One-to-One
- **Admin → Role:** Enum (administrator/moderator)

---

## 🚀 Key Features

### For Seekers
- ✅ Browse services by location and category
- ✅ Multi-service cart system
- ✅ Secure payment integration (Razorpay)
- ✅ Booking management
- ✅ Feedback and rating system
- ✅ Profile management

### For Helpers
- ✅ Application with certification upload
- ✅ Service request management
- ✅ Schedule visualization
- ✅ Earnings tracking
- ✅ Customer feedback viewing
- ✅ Profile and availability updates

### For Administrators
- ✅ Complete user management
- ✅ Helper approval workflow
- ✅ Moderator application management
- ✅ Location and moderator assignment
- ✅ Service and category CRUD
- ✅ Platform-wide analytics
- ✅ Booking oversight
- ✅ Feedback monitoring

### For Moderators
- ✅ Location-specific helper management
- ✅ Helper application approval/rejection
- ✅ Location booking tracking
- ✅ Platform services visibility
- ✅ Location earnings analytics
- ✅ Profile management
- ✅ Dashboard with location statistics

---

## 🔄 Workflows

### Helper Onboarding
1. Helper fills signup form with category selection
2. Uploads certifications
3. Application submitted with 'approved: false'
4. Moderator (of that location) reviews application
5. Moderator approves/rejects
6. Helper receives notification
7. If approved, can start receiving requests

### Moderator Onboarding
1. Applicant submits moderator application
2. Selects desired location
3. Status set to 'pending'
4. Administrator reviews application
5. Administrator approves and assigns location OR rejects
6. Location status updates
7. Moderator can access dashboard

### Service Booking Flow
1. Seeker searches for services
2. Adds desired services to cart
3. Proceeds to booking form
4. Fills date, time, address
5. Proceeds to payment
6. Makes payment via Razorpay
7. Booking created with 'Pending' status
8. Helper receives request
9. Helper accepts/rejects
10. Seeker receives notification
11. Service completed
12. Seeker provides feedback

---

## 📁 Project Structure

```
ServiceSphere-FSD/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard/
│   │   │   ├── AdministratorDashboard/
│   │   │   ├── ModeratorDashboard/
│   │   │   ├── HelperDashboard/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Navbar/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage/
│   │   │   ├── SignupSeeker/
│   │   │   ├── SignupHelper/
│   │   │   ├── SignupAdmin/
│   │   │   ├── ApplyModerator/
│   │   │   ├── Home/
│   │   │   ├── SearchPage/
│   │   │   ├── CartPage/
│   │   │   ├── BookingForm/
│   │   │   ├── PaymentPage/
│   │   │   ├── PreviousBookings/
│   │   │   ├── SeekerProfile/
│   │   │   ├── AboutUs/
│   │   │   ├── AdminContact/
│   │   │   ├── TermsAndConditions/
│   │   │   ├── NotFound/
│   │   │   └── Unauthorized/
│   │   ├── context/
│   │   │   ├── ThemeContext.js
│   │   │   └── ToastContext.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── userSlice.js
│   │   │   ├── cartSlice.js
│   │   │   └── bookingFormSlice.js
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── moderatorController.js
│   │   ├── helperController.js
│   │   ├── seekerController.js
│   │   ├── bookingController.js
│   │   ├── serviceController.js
│   │   ├── feedbackController.js
│   │   └── messageController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── customMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Seeker.js
│   │   ├── Helper.js
│   │   ├── Booking.js
│   │   ├── Service.js
│   │   ├── Category.js
│   │   ├── Location.js
│   │   ├── Feedback.js
│   │   ├── ServiceRequest.js
│   │   └── ContactMessage.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── moderatorRoutes.js
│   │   ├── helperRoutes.js
│   │   ├── seekerRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── messageRoutes.js
│   ├── uploads/              # File storage
│   ├── index.js              # Server entry point
│   └── package.json
│
├── README.md
├── MIDDLEWARE_OVERVIEW.md
└── .gitignore
```

---

## 🌐 API Endpoints Summary

### Authentication
- POST `/auth/signup/seeker` - Seeker registration
- POST `/auth/signup/helper` - Helper registration
- POST `/auth/signup/admin` - Admin registration
- POST `/auth/login/seeker` - Seeker login
- POST `/auth/login/helper` - Helper login
- POST `/auth/login/admin` - Admin login

### Moderator
- POST `/moderator/apply/moderator` - Apply as moderator
- POST `/moderator/login/moderator` - Moderator login
- GET `/api/moderator/dashboard` - Dashboard data
- GET `/api/moderator/helpers` - Get helpers in location
- PATCH `/api/moderator/helpers/:id/approve` - Approve helper
- PATCH `/api/moderator/helpers/:id/reject` - Reject helper
- GET `/api/moderator/bookings` - Get location bookings
- GET `/api/moderator/services` - Get all services
- GET `/api/moderator/earnings-data` - Get location earnings
- GET `/api/moderator/profile` - Get profile
- PUT `/api/moderator/profile` - Update profile

### Administrator
- GET `/api/admin/dashboard` - Dashboard statistics
- GET `/api/admin/users` - All users
- GET `/api/admin/helpers` - All helpers
- GET `/api/admin/moderators` - Moderator applications
- PATCH `/api/admin/moderators/:id/approve` - Approve moderator
- PATCH `/api/admin/moderators/:id/reject` - Reject moderator
- GET `/api/admin/bookings` - All bookings
- GET `/api/admin/services` - Service management
- POST `/api/admin/categories` - Create category
- GET `/api/admin/locations` - Location management
- GET `/api/admin/feedbacks` - All feedback
- GET `/api/admin/earnings-data` - Platform earnings

### Services
- GET `/api/services/categories` - Get categories
- GET `/api/services` - Get services
- POST `/api/services` - Create service

### Bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings/user/:seekerId` - User bookings
- GET `/api/bookings/helper/:helperId` - Helper bookings

### Feedback
- POST `/api/feedback` - Submit feedback
- GET `/api/feedback/helper/:helperId` - Helper feedback

---

## 🔧 Environment Variables

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/servicesphere
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
```

---

## 🎯 Future Enhancements

- Real-time notifications (Socket.io)
- Email notifications
- SMS integration
- Advanced search and filters
- Helper availability calendar
- Multi-language support
- Mobile app (React Native)
- AI-powered service recommendations
- Chatbot support
- Video call for consultations
- Subscription plans for helpers
- Promotional campaigns

---

**Last Updated:** March 4, 2026
