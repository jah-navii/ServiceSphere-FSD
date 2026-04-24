# Bugs Found by Tests

These bugs were discovered while writing and running the Phase A test suite.

---

## BUG-001 — Booking creation always fails with 500 (Mongoose validation error)

**Severity**: Critical (data-integrity)  
**File**: `server/controllers/bookingController.js`, line 46  
**Status**: Fixed

**Description**:  
`Booking.create()` was called with `status: "Pending"` (capital P). The `Booking` schema enum only allows lowercase values: `['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']`. Every booking creation request returned a 500 Internal Server Error with a Mongoose validation error.

**Fix**:  
Changed `status: "Pending"` → `status: "pending"`.

---

## BUG-002 — `feedbackController.js` allows feedback on non-completed bookings

**Severity**: Medium (business logic)  
**File**: `server/controllers/feedbackController.js`  
**Status**: Not fixed (flagged only)

**Description**:  
The feedback controller does not verify that the booking is in `completed` status before accepting a feedback submission. A seeker can submit feedback for a `pending` or `in_progress` booking.

---

## BUG-003 — `feedbackController.js` allows duplicate feedback for the same booking

**Severity**: Medium (data-integrity)  
**File**: `server/controllers/feedbackController.js`  
**Status**: Not fixed (flagged only)

**Description**:  
There is no duplicate guard — a seeker can submit multiple feedback entries for the same booking, inflating helper ratings.

---

## BUG-004 — `bookingController.js` uses emoji in production log output

**Severity**: Low (code quality)  
**File**: `server/controllers/bookingController.js`, line 50  
**Status**: Not fixed (flagged only)

**Description**:  
`console.log("🎯 Booking created:", newBooking._id)` and `console.error("Booking Error:")` use emoji characters. This can cause encoding issues in some log aggregators and makes log parsing harder.
