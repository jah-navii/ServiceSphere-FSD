import Admin from '../models/Admin.js';
import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Location from '../models/Location.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtUtils.js';

// ==================== MODERATOR APPLICATION ====================

// Public: Apply to become moderator
export const applyModerator = async (req, res) => {
  try {
    const { name, email, phone, password, desiredLocation } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !desiredLocation) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if location exists
    const location = await Location.findById(desiredLocation);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Check if location already has a moderator
    const locationWithModerator = await Admin.findOne({ 
      assignedLocation: desiredLocation,
      status: { $in: ['active', 'pending'] }
    });
    
    if (locationWithModerator) {
      return res.status(409).json({ 
        error: 'This location already has a moderator assigned or pending' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create moderator application
    const moderator = new Admin({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'moderator',
      assignedLocation: desiredLocation,
      status: 'pending',
      applicationDate: new Date()
    });

    await moderator.save();

    return res.status(201).json({ 
      success: true,
      message: 'Moderator application submitted successfully. Please wait for administrator approval.' 
    });

  } catch (error) {
    console.error('Moderator Application Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Moderator Login
export const loginModerator = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find moderator
    const moderator = await Admin.findOne({ email, role: 'moderator' }).populate('assignedLocation');

    if (!moderator) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if approved
    if (moderator.status !== 'active') {
      return res.status(403).json({ 
        error: `Your account is ${moderator.status}. Please contact administrator.` 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, moderator.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const userData = {
      id: moderator._id,
      name: moderator.name,
      email: moderator.email,
      role: 'moderator',
      locationId: moderator.assignedLocation?._id,
      locationName: moderator.assignedLocation?.name
    };

    const token = generateToken(userData);

    console.log(`Moderator logged in: ${moderator.name} (${moderator.assignedLocation?.name})`);

    return res.status(200).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Moderator Login Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== MODERATOR DASHBOARD ====================

// Get moderator dashboard data (location-specific)
export const getModeratorDashboard = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    const locationId = moderator.assignedLocation;
    console.log('Moderator Dashboard - Location ID:', locationId);

    // Get helpers in this location
    const helpers = await Helper.find({ location: locationId });
    console.log('Found helpers in location:', helpers.length);
    const pendingHelpers = helpers.filter(h => !h.approved).length;
    const approvedHelpers = helpers.filter(h => h.approved).length;

    // Get bookings in this location
    const bookings = await Booking.find()
      .populate('helper')
      .then(bookings => bookings.filter(b => b.helper?.location?.toString() === locationId.toString()));

    const totalBookings = bookings.length;
    
    // Completed bookings = past date + paid
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return b.paid === true && bookingDate < today;
    }).length;
    
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    // Calculate revenue from completed bookings
    const revenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return b.paid === true && bookingDate < today;
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);

    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(b.createdAt))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        location: await Location.findById(locationId),
        stats: {
          totalHelpers: helpers.length,
          pendingHelpers,
          activeHelpers: approvedHelpers,
          totalBookings,
          todayBookings: bookings.filter(b => {
            const today = new Date();
            const bookingDate = new Date(b.createdAt);
            return bookingDate.toDateString() === today.toDateString();
          }).length,
          completedBookings,
          pendingBookings,
          totalServices: await Service.countDocuments(),
          revenue
        },
        recentBookings
      }
    });

  } catch (error) {
    console.error('Moderator Dashboard Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== HELPER MANAGEMENT (Location-scoped) ====================

// Get helpers in moderator's location
export const getLocationHelpers = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    console.log('Get Location Helpers - Moderator Location:', moderator.assignedLocation);
    const helpers = await Helper.find({ location: moderator.assignedLocation })
      .populate('location')
      .populate('category')
      .sort({ createdAt: -1 });
    console.log('Found helpers:', helpers.length);

    return res.status(200).json({
      success: true,
      data: helpers
    });

  } catch (error) {
    console.error('Get Location Helpers Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Approve helper (moderator can only approve helpers in their location)
export const approveHelper = async (req, res) => {
  try {
    const { helperId } = req.params;
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ error: 'Helper not found' });
    }

    // Check if helper is in moderator's location
    if (helper.location.toString() !== moderator.assignedLocation.toString()) {
      return res.status(403).json({ error: 'You can only approve helpers in your location' });
    }

    helper.isApproved = true;
    await helper.save();

    return res.status(200).json({
      success: true,
      message: 'Helper approved successfully',
      data: helper
    });

  } catch (error) {
    console.error('Approve Helper Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Reject helper
export const rejectHelper = async (req, res) => {
  try {
    const { helperId } = req.params;
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({ error: 'Helper not found' });
    }

    // Check if helper is in moderator's location
    if (helper.location.toString() !== moderator.assignedLocation.toString()) {
      return res.status(403).json({ error: 'You can only reject helpers in your location' });
    }

    await Helper.findByIdAndDelete(helperId);

    return res.status(200).json({
      success: true,
      message: 'Helper rejected and removed'
    });

  } catch (error) {
    console.error('Reject Helper Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== BOOKING MANAGEMENT (Location-scoped) ====================

// Get bookings in moderator's location
export const getLocationBookings = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    const locationId = moderator.assignedLocation;
    console.log('Fetching bookings for location:', locationId);

    // First, get all helpers in this location
    const helpersInLocation = await Helper.find({ location: locationId }).select('_id');
    const helperIds = helpersInLocation.map(h => h._id);

    console.log(`Found ${helperIds.length} helpers in location`);

    // Get bookings for these helpers
    const locationBookings = await Booking.find({ helper: { $in: helperIds } })
      .populate('helper', 'name email mobilenumber')
      .populate('seeker', 'name email mobilenumber')
      .sort({ createdAt: -1 });

    console.log(`Found ${locationBookings.length} bookings for location`);

    // Transform the data to include service information
    const formattedBookings = locationBookings.map(booking => ({
      _id: booking._id,
      seeker: booking.seeker,
      helper: booking.helper,
      service: { name: booking.service_type },
      date: booking.date,
      time: booking.time,
      address: booking.address,
      status: booking.status,
      totalAmount: booking.price,
      paid: booking.paid,
      createdAt: booking.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: formattedBookings
    });

  } catch (error) {
    console.error('Get Location Bookings Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== SERVICE MANAGEMENT (Location-scoped) ====================

// Get services available in moderator's location
export const getLocationServices = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    console.log('Fetching all platform services for moderator');

    // Get all categories
    const categories = await Category.find().sort({ name: 1 });

    // For each category, get its services
    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        const services = await Service.find({ 
          category: category._id
        }).sort({ name: 1 });

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          image: category.image,
          services: services
        };
      })
    );

    console.log(`Found ${categoriesWithServices.length} categories with services`);

    return res.status(200).json({
      success: true,
      data: categoriesWithServices
    });

  } catch (error) {
    console.error('Get Location Services Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== MODERATOR PROFILE ====================

// Get moderator profile
export const getModeratorProfile = async (req, res) => {
  try {
    const moderatorId = req.user.id;

    const moderator = await Admin.findById(moderatorId).populate('assignedLocation');

    if (!moderator) {
      return res.status(404).json({ error: 'Moderator not found' });
    }

    return res.status(200).json({
      success: true,
      profile: {
        id: moderator._id,
        name: moderator.name,
        email: moderator.email,
        phone: moderator.phone,
        role: moderator.role,
        locationId: moderator.assignedLocation?._id,
        locationName: moderator.assignedLocation?.name,
        status: moderator.status,
        applicationDate: moderator.applicationDate
      }
    });

  } catch (error) {
    console.error('Get Moderator Profile Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update moderator profile
export const updateModeratorProfile = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const { name, phone } = req.body;

    if (!name && !phone) {
      return res.status(400).json({ error: 'Please provide fields to update' });
    }

    const moderator = await Admin.findById(moderatorId);

    if (!moderator) {
      return res.status(404).json({ error: 'Moderator not found' });
    }

    // Update allowed fields
    if (name) moderator.name = name;
    if (phone) moderator.phone = phone;

    await moderator.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: moderator._id,
        name: moderator.name,
        email: moderator.email,
        phone: moderator.phone
      }
    });

  } catch (error) {
    console.error('Update Moderator Profile Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== MODERATOR EARNINGS DATA ====================

// GET /api/moderator/earnings-data
export const getLocationEarningsData = async (req, res) => {
  try {
    const moderatorId = req.user.userId;

    // Get moderator details
    const moderator = await Admin.findById(moderatorId).populate('assignedLocation');
    if (!moderator || !moderator.assignedLocation) {
      return res.status(404).json({ error: 'Moderator or location not found' });
    }

    const locationId = moderator.assignedLocation._id;

    // Get all helpers in this location
    const helpers = await Helper.find({ location: locationId });
    const helperIds = helpers.map(h => h._id);

    // 1. Monthly Earnings
    const monthlyEarnings = await Booking.aggregate([
      { $match: { helper: { $in: helperIds } } },
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] }, // Group by YYYY-MM
          total: { $sum: "$price" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Category-wise Earnings
    const categoryEarnings = await Booking.aggregate([
      { $match: { helper: { $in: helperIds } } },
      {
        $group: {
          _id: "$service_type",
          total: { $sum: "$price" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // 3. Daily Trends
    const dailyTrends = await Booking.aggregate([
      { $match: { helper: { $in: helperIds } } },
      {
        $group: {
          _id: "$date",
          total: { $sum: "$price" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Payment Status
    const paymentStatus = await Booking.aggregate([
      { $match: { helper: { $in: helperIds } } },
      {
        $group: {
          _id: "$paid",
          total: { $sum: "$price" }
        }
      }
    ]);

    // 5. Top Earning Helpers (in this location)
    const topHelpers = await Booking.aggregate([
      { $match: { helper: { $in: helperIds } } },
      {
        $lookup: {
          from: "helpers",
          localField: "helper",
          foreignField: "_id",
          as: "helperData"
        }
      },
      {
        $unwind: "$helperData"
      },
      {
        $group: {
          _id: "$helper",
          name: { $first: "$helperData.name" },
          total: { $sum: "$price" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // Format Response
    const earningsData = {
      monthlyEarnings: monthlyEarnings.map(e => ({ month: e._id, amount: e.total })),
      categoryEarnings: categoryEarnings.map(e => ({ category: e._id, amount: e.total })),
      dailyTrends: dailyTrends.map(e => ({ date: e._id, amount: e.total })),
      paymentStatus: paymentStatus.reduce((acc, curr) => {
        if (curr._id === true) acc.received = curr.total;
        else acc.pending = curr.total;
        return acc;
      }, { received: 0, pending: 0 }),
      topHelpers: topHelpers.map(h => ({ name: h.name, amount: h.total }))
    };

    res.status(200).json(earningsData);

  } catch (error) {
    console.error("Error fetching location earnings data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  applyModerator,
  loginModerator,
  getModeratorDashboard,
  getLocationHelpers,
  approveHelper,
  rejectHelper,
  getLocationBookings,
  getLocationServices,
  getModeratorProfile,
  updateModeratorProfile,
  getLocationEarningsData
};
