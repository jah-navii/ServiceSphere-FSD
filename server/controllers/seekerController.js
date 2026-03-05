import Seeker from '../models/Seeker.js';
import Booking from '../models/Booking.js';
import Helper from '../models/Helper.js';

// GET /home — Seeker Home
export const renderHome = (req, res) => {
  if (!req.user || req.user.role !== 'seeker') {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Seeker login required'
      });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Return JSON for React frontend
  res.status(200).json({
    success: true,
    user: req.user
  });
};

// GET /profile — Seeker Profile Page
export const getSeekerProfile = async (req, res) => {
  if (!req.user || req.user.role !== 'seeker') {
    // For API calls, return 401 instead of redirect
    if (req.originalUrl.includes('/api/') || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Seeker login required'
      });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // If it's an API call, fetch full seeker data and return JSON
  if (req.originalUrl.includes('/api/') || req.headers.accept?.includes('application/json')) {
    try {
      const seeker = await Seeker.findById(req.user.id).select('-password');
      return res.status(200).json({
        success: true,
        seeker: seeker || req.user
      });
    } catch (err) {
      console.error("Get profile error:", err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: err.message
      });
    }
  }

  // Otherwise, render the view (for legacy server-rendered pages if any)
  res.status(200).json({
    success: true,
    seeker: req.user
  });
};




// POST /update-seeker-profile — Seeker Profile Update
export const updateSeekerProfile = async (req, res) => {
  const { name, mobilenumber, address } = req.body;
  const seekerId = req.user.id;

  try {
    const seeker = await Seeker.findByIdAndUpdate(
      seekerId,
      { name, mobilenumber, address },
      { new: true }
    );

    // Return JSON response
    if (req.originalUrl.includes('/api/') || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        seeker: {
          id: seeker._id,
          name: seeker.name,
          email: seeker.email,
          mobilenumber: seeker.mobilenumber,
          address: seeker.address
        }
      });
    }

    // Default response
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      seeker: {
        id: seeker._id,
        name: seeker.name,
        email: seeker.email,
        mobilenumber: seeker.mobilenumber,
        address: seeker.address
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    
    // Return JSON error for API calls
    if (req.originalUrl.includes('/api/') || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: err.message
      });
    }
    
    res.status(500).send("Internal Server Error");
  }
};

export const showCart = async (req, res) => {
  if (!req.user || req.user.role !== 'seeker') {
    if (req.headers.accept?.includes('application/json')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Seeker login required'
      });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const bookings = await Booking.find({
      seeker: req.user.id,
      date: { $gte: today }
    })
    .populate('helper', 'name') // Only get helper's name
    .lean(); // Convert Mongoose documents to plain JS objects
    
    // Format bookings for the view
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      helperName: booking.helper.name,
      serviceType: booking.service_type,
      date: booking.date,
      time: booking.time,
      price: booking.price,
      status: booking.status,
      paid: booking.paid || false
    }));

    // Return JSON for React frontend
    res.status(200).json({
      success: true,
      bookings: formattedBookings
    });
  } catch (err) {
    console.error("Cart Error:", err);
    res.status(500).json({
      success: false,
      message: 'Error loading cart',
      error: err.message
    });
  }
};