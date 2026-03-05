# ServiceSphere - Database Schema Documentation

## Overview
ServiceSphere uses **MongoDB** as the database with **Mongoose ODM** for schema definition and data modeling. The database follows a relational-like structure with document references.

---

## Database Collections

### 1. **Admin Collection**
Stores both administrators and moderators with role-based access.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  role: String (enum: ['moderator', 'administrator'], default: 'moderator'),
  
  // Location Assignment (for moderators only)
  assignedLocation: ObjectId (ref: 'Location', default: null),
  
  // Application Status
  status: String (enum: ['pending', 'active', 'suspended', 'rejected']),
  
  // Tracking Fields
  applicationDate: Date (default: Date.now),
  approvedBy: ObjectId (ref: 'Admin', default: null),
  approvedDate: Date,
  rejectionReason: String,
  
  // Automatic timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ role: 1, status: 1 }` - Efficient role and status queries
- `{ assignedLocation: 1 }` - Quick moderator-location lookups

**Business Rules:**
- Moderators start with `status: 'pending'`
- Administrators are created with `status: 'active'`
- Each location can have only one active moderator
- Email must be unique across all admins

---

### 2. **Seeker Collection**
Stores service seekers (customers).

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  mobilenumber: String (required),
  address: String (required)
}
```

**Business Rules:**
- Email must be unique
- All fields are mandatory
- Password is hashed with bcrypt (10 rounds)

---

### 3. **Helper Collection**
Stores service providers with their offerings and certifications.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  mobilenumber: String (required),
  aadharnumber: String (required),
  gender: String (required),
  address: String,
  
  // Location Reference
  location: ObjectId (ref: 'Location'),
  
  // Category Constraint (ONE category per helper)
  category: ObjectId (ref: 'Category', required),
  
  // Services from the selected category
  services: [
    {
      serviceId: ObjectId (ref: 'Service', required),
      name: String (required),
      price: Number (required)
    }
  ],
  
  availability: String,
  certifications: [String],  // Array of file paths
  approved: Boolean (default: false),
  
  // Automatic timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Business Rules:**
- Helper can only select ONE category
- Services must belong to the selected category
- Each service has individual pricing set by helper
- Certifications are stored as file paths
- Approved status starts as `false`, requires moderator approval
- Email and Aadhar must be unique

---

### 4. **Location Collection**
Stores service locations with moderator assignments.

```javascript
{
  _id: ObjectId,
  name: String (required, unique, trimmed),
  city: String,
  state: String,
  
  // Assigned Moderator
  moderator: ObjectId (ref: 'Admin', default: null),
  
  // Location Status
  status: String (enum: ['active', 'inactive', 'pending_moderator'], 
                  default: 'pending_moderator'),
  
  // Automatic timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ moderator: 1 }` - Quick moderator lookups
- `{ status: 1 }` - Status-based filtering

**Business Rules:**
- Location names must be unique
- One moderator per location
- Status changes to 'active' when moderator is assigned
- Cannot delete location if it has helpers or active moderator

---

### 5. **Category Collection**
Stores service categories (e.g., Home Repairs, Beauty Services).

```javascript
{
  _id: ObjectId,
  name: String (required, unique, trimmed),
  description: String,
  image: String,  // Image path or URL
  
  // Automatic timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Business Rules:**
- Category names must be unique
- Cannot delete category if it has associated services
- Image is optional for UI display

---

### 6. **Service Collection**
Stores individual services within categories.

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  
  // Category Reference
  category: ObjectId (ref: 'Category', required),
  
  isActive: Boolean (default: true)
}
```

**Indexes:**
- `{ name: 1, category: 1 }` - Unique constraint (prevents duplicate service names within same category)

**Business Rules:**
- Service name must be unique within a category
- Same service name can exist in different categories
- Inactive services are hidden from helpers during signup
- Cannot delete service if helpers are offering it

---

### 7. **Booking Collection**
Stores all service bookings.

```javascript
{
  _id: ObjectId,
  
  // References
  helper: ObjectId (ref: 'Helper', required),
  seeker: ObjectId (ref: 'Seeker', required),
  
  // Booking Details
  service_type: String (required),
  date: String (required),  // Format: YYYY-MM-DD
  time: String (required),
  address: String (required),
  
  // Status & Payment
  status: String (required),  // Pending/Confirmed/Completed/Cancelled
  price: Number (required),
  paid: Boolean (default: false)
}
```

**Business Rules:**
- Helper and Seeker must exist
- Date stored as string for easy aggregation
- Status tracks booking lifecycle
- Payment status tracked separately
- Used for earnings calculations and analytics

---

### 8. **Feedback Collection**
Stores customer feedback for helpers.

```javascript
{
  _id: ObjectId,
  
  // References
  seeker: ObjectId (ref: 'Seeker', required),
  helper: ObjectId (ref: 'Helper', required),
  
  // Feedback Content
  feedback: String (required),
  rating: Number (required, min: 1, max: 5),
  date: Date (default: Date.now)
}
```

**Business Rules:**
- Rating must be between 1 and 5
- One feedback per booking (enforced at application level)
- Only completed bookings can receive feedback
- Seeker and Helper must exist

---

### 9. **ServiceRequest Collection**
Stores service requests (alternate booking workflow).

```javascript
{
  _id: ObjectId,
  
  // References
  helper: ObjectId (ref: 'Helper', required),
  seeker: ObjectId (ref: 'Seeker', required),
  
  // Request Details
  customer_name: String (required),
  service_type: String (required),
  date: String (required),
  time: String (required),
  address: String (required),
  status: String (default: 'Pending')
}
```

**Business Rules:**
- Initially created as 'Pending'
- Helper can accept/reject
- Upon acceptance, may convert to Booking

---

### 10. **ContactMessage Collection**
Stores contact form submissions.

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  adminId: String (required),
  phone: String (required),
  issueType: String (required),
  message: String (required),
  submittedAt: Date (default: Date.now)
}
```

**Business Rules:**
- All fields required
- Stored for administrator review
- Can be responded to via email

---

## Relationships & References

### One-to-Many Relationships

1. **Location → Helpers**
   - One location has many helpers
   - Helper references Location via `location` field
   - Query: `Helper.find({ location: locationId })`

2. **Category → Services**
   - One category contains many services
   - Service references Category via `category` field
   - Query: `Service.find({ category: categoryId })`

3. **Category → Helpers**
   - One category is offered by many helpers
   - Helper references Category via `category` field
   - Query: `Helper.find({ category: categoryId })`

4. **Helper → Bookings**
   - One helper has many bookings
   - Booking references Helper via `helper` field
   - Query: `Booking.find({ helper: helperId })`

5. **Seeker → Bookings**
   - One seeker makes many bookings
   - Booking references Seeker via `seeker` field
   - Query: `Booking.find({ seeker: seekerId })`

6. **Helper → Feedback**
   - One helper receives many feedbacks
   - Feedback references Helper via `helper` field
   - Query: `Feedback.find({ helper: helperId })`

### One-to-One Relationships

1. **Location → Moderator**
   - Each location has one moderator
   - Location references Admin via `moderator` field
   - Admin (moderator) references Location via `assignedLocation`
   - Constraint enforced at application level

### Many-to-Many Relationships (via references)

1. **Helper → Services**
   - Helper can offer multiple services
   - Services can be offered by multiple helpers
   - Stored as embedded array in Helper document
   - Each entry contains `serviceId`, `name`, and `price`

---

## Aggregation Pipelines

### Monthly Earnings Aggregation
```javascript
Booking.aggregate([
  { $match: { helper: { $in: helperIds } } },
  {
    $group: {
      _id: { $substr: ["$date", 0, 7] },  // YYYY-MM
      total: { $sum: "$price" }
    }
  },
  { $sort: { _id: 1 } }
])
```

### Category Earnings
```javascript
Booking.aggregate([
  { $match: { helper: { $in: helperIds } } },
  {
    $group: {
      _id: "$service_type",
      total: { $sum: "$price" }
    }
  },
  { $sort: { total: -1 } }
])
```

### Top Helpers
```javascript
Booking.aggregate([
  { $match: { /* filters */ } },
  {
    $lookup: {
      from: "helpers",
      localField: "helper",
      foreignField: "_id",
      as: "helperData"
    }
  },
  { $unwind: "$helperData" },
  {
    $group: {
      _id: "$helper",
      name: { $first: "$helperData.name" },
      total: { $sum: "$price" }
    }
  },
  { $sort: { total: -1 } },
  { $limit: 5 }
])
```

### Payment Status
```javascript
Booking.aggregate([
  {
    $group: {
      _id: "$paid",
      total: { $sum: "$price" }
    }
  }
])
```

---

## Security & Data Integrity

### Password Security
- All passwords hashed using **bcrypt** with 10 salt rounds
- Never stored in plain text
- Compared using `bcrypt.compare()` during login

### Unique Constraints
- **Email uniqueness:**
  - Admin: Unique across all admins
  - Seeker: Unique across all seekers
  - Helper: Unique across all helpers
- **Service uniqueness:** Name + Category combination must be unique
- **Location uniqueness:** Location name must be unique
- **Category uniqueness:** Category name must be unique

### Referential Integrity
- Foreign key references use ObjectId
- Cascade deletes handled at application level
- Orphaned documents prevented through validation

### Data Validation
- Required fields enforced at schema level
- Enum values restricted to predefined options
- Min/Max constraints on numeric fields (e.g., ratings 1-5)
- String trimming on text fields
- Email format validation (application level)

---

## Indexing Strategy

### Performance Indexes

1. **Admin Collection:**
   - `{ role: 1, status: 1 }` - Role-based queries with status filtering
   - `{ assignedLocation: 1 }` - Location-to-moderator lookups

2. **Service Collection:**
   - `{ name: 1, category: 1 }` - Unique constraint + fast category lookups

3. **Location Collection:**
   - `{ moderator: 1 }` - Moderator assignment queries
   - `{ status: 1 }` - Status-based filtering

### Default Indexes
- `_id` fields are automatically indexed by MongoDB
- Unique fields create automatic unique indexes

---
