import Admin from '../models/Admin.js';
import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Booking from '../models/Booking.js';
import Feedback from '../models/Feedback.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Location from '../models/Location.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtUtils.js';

// ==================== MODERATOR APPLICATION ====================

// Public: Apply to become moderator  (multipart/form-data — resume upload via multer)
export const applyModerator = async (req, res) => {
  try {
    const { name, email, phone, password, desiredLocation, coverLetter, experience, linkedinProfile } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !desiredLocation || !coverLetter) {
      return res.status(400).json({ error: 'All required fields must be filled (including cover letter)' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume (PDF) is required' });
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

    // Check if location already has an active/pending moderator
    const locationWithModerator = await Admin.findOne({ 
      assignedLocation: desiredLocation,
      status: { $in: ['active', 'pending'] }
    });
    
    if (locationWithModerator) {
      return res.status(409).json({ 
        error: 'This location already has a moderator assigned or a pending application' 
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
      applicationDate: new Date(),
      coverLetter,
      experience: experience || null,
      linkedinProfile: linkedinProfile || null,
      resume: req.file.path.replace(/\\/g, '/'),  // normalise to forward-slash paths
    });

    await moderator.save();

    return res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully. We will review it and get back to you.' 
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
    const pendingHelpers = helpers.filter(h => !h.approved && !h.suspended).length;
    const activeHelpers  = helpers.filter(h =>  h.approved && !h.suspended).length;
    const suspendedHelpers = helpers.filter(h => h.suspended).length;
    const helperIds = helpers.map(h => h._id);

    // Get bookings for helpers in this location
    const bookings = await Booking.find({ helper: { $in: helperIds } })
      .populate('helper', 'name')
      .populate('seeker', 'name');

    const todayStr   = new Date().toISOString().split('T')[0];
    const monthStr   = todayStr.substring(0, 7);

    const todayBookings     = bookings.filter(b => b.date === todayStr).length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings   = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    const totalRevenue   = bookings.filter(b => b.paid).reduce((s, b) => s + (b.price || 0), 0);
    const monthlyRevenue = bookings
      .filter(b => b.paid && b.date && b.date.startsWith(monthStr))
      .reduce((s, b) => s + (b.price || 0), 0);

    // Distinct seekers who have booked
    const totalSeekers = new Set(bookings.map(b => b.seeker?._id?.toString()).filter(Boolean)).size;

    // Average rating
    const feedbacks = await Feedback.find({ helper: { $in: helperIds } });
    const avgRating = feedbacks.length
      ? parseFloat((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1))
      : null;

    // Recent bookings (last 5, sorted by date desc)
    const recentBookings = [...bookings]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map(b => ({
        _id: b._id,
        seeker: b.seeker,
        helper: b.helper,
        service_type: b.service_type,
        date: b.date,
        time: b.time,
        status: b.status,
        price: b.price,
        paid: b.paid
      }));

    // Pending helper applications (first 3 for dashboard widget)
    const pendingHelpersList = helpers
      .filter(h => !h.approved && !h.suspended)
      .slice(0, 3)
      .map(h => ({ _id: h._id, name: h.name, createdAt: h.createdAt }));

    return res.status(200).json({
      success: true,
      data: {
        location: await Location.findById(locationId),
        moderator: { name: moderator.name },
        stats: {
          totalHelpers: helpers.length,
          pendingHelpers,
          activeHelpers,
          suspendedHelpers,
          totalSeekers,
          totalBookings: bookings.length,
          todayBookings,
          completedBookings,
          pendingBookings,
          cancelledBookings,
          totalRevenue,
          monthlyRevenue,
          avgRating
        },
        recentBookings,
        pendingHelpersList
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

// Suspend an approved helper
export const suspendHelper = async (req, res) => {
  try {
    const { helperId } = req.params;
    const moderator = await Admin.findById(req.user.id);
    if (!moderator?.assignedLocation) return res.status(403).json({ error: 'No location assigned' });

    const helper = await Helper.findById(helperId);
    if (!helper) return res.status(404).json({ error: 'Helper not found' });
    if (helper.location.toString() !== moderator.assignedLocation.toString())
      return res.status(403).json({ error: 'Not in your location' });

    helper.suspended = true;
    await helper.save();
    return res.status(200).json({ success: true, message: 'Helper suspended' });
  } catch (error) {
    console.error('Suspend Helper Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Reactivate a suspended helper
export const reactivateHelper = async (req, res) => {
  try {
    const { helperId } = req.params;
    const moderator = await Admin.findById(req.user.id);
    if (!moderator?.assignedLocation) return res.status(403).json({ error: 'No location assigned' });

    const helper = await Helper.findById(helperId);
    if (!helper) return res.status(404).json({ error: 'Helper not found' });
    if (helper.location.toString() !== moderator.assignedLocation.toString())
      return res.status(403).json({ error: 'Not in your location' });

    helper.suspended = false;
    await helper.save();
    return res.status(200).json({ success: true, message: 'Helper reactivated' });
  } catch (error) {
    console.error('Reactivate Helper Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ==================== USER MANAGEMENT (Location-scoped seekers) ====================

export const getLocationUsers = async (req, res) => {
  try {
    const moderator = await Admin.findById(req.user.id);
    if (!moderator?.assignedLocation) return res.status(403).json({ error: 'No location assigned' });

    const helperIds = (await Helper.find({ location: moderator.assignedLocation }).select('_id')).map(h => h._id);

    const bookings = await Booking.find({ helper: { $in: helperIds } })
      .populate('seeker', 'name email mobilenumber address suspended')
      .sort({ date: -1 });

    // Aggregate per seeker
    const seekerMap = {};
    bookings.forEach(b => {
      if (!b.seeker) return;
      const sId = b.seeker._id.toString();
      if (!seekerMap[sId]) {
        seekerMap[sId] = {
          seeker: b.seeker,
          totalBookings: 0,
          totalSpent: 0,
          lastBookingDate: b.date
        };
      }
      seekerMap[sId].totalBookings++;
      if (b.paid) seekerMap[sId].totalSpent += b.price || 0;
    });

    const users = Object.values(seekerMap).sort((a, b) => b.totalBookings - a.totalBookings);
    const totalRevenue = users.reduce((s, u) => s + u.totalSpent, 0);

    return res.status(200).json({
      success: true,
      data: {
        users,
        stats: {
          totalUsers: users.length,
          totalBookings: bookings.length,
          totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get Location Users Error:', error);
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
    const moderatorId = req.user.id;

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
  suspendHelper,
  reactivateHelper,
  getLocationUsers,
  getLocationBookings,
  getLocationServices,
  getModeratorProfile,
  updateModeratorProfile,
  getLocationEarningsData
};

// ==================== FEEDBACK (Location-scoped) ====================

export const getLocationFeedbacks = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const moderator = await Admin.findById(moderatorId);

    if (!moderator || !moderator.assignedLocation) {
      return res.status(403).json({ error: 'No location assigned' });
    }

    const locationId = moderator.assignedLocation;

    // All helpers in this location
    const helpersInLocation = await Helper.find({ location: locationId }).select('_id');
    const helperIds = helpersInLocation.map(h => h._id);

    // All feedbacks for those helpers
    const feedbacks = await Feedback.find({ helper: { $in: helperIds } })
      .populate('seeker', 'name email')
      .populate('helper', 'name email')
      .sort({ date: -1 });

    // Per-helper stats
    const helperStatsMap = {};
    feedbacks.forEach(f => {
      const hId = f.helper?._id?.toString();
      if (!hId) return;
      if (!helperStatsMap[hId]) {
        helperStatsMap[hId] = { helper: f.helper, total: 0, sum: 0, counts: [0, 0, 0, 0, 0] };
      }
      helperStatsMap[hId].total++;
      helperStatsMap[hId].sum += f.rating;
      helperStatsMap[hId].counts[f.rating - 1]++;
    });

    const helperStats = Object.values(helperStatsMap).map(h => ({
      helper: h.helper,
      totalReviews: h.total,
      averageRating: h.total ? parseFloat((h.sum / h.total).toFixed(1)) : 0,
      ratingCounts: h.counts
    })).sort((a, b) => b.totalReviews - a.totalReviews);

    const overallAvg = feedbacks.length
      ? parseFloat((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1))
      : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(
      r => feedbacks.filter(f => f.rating === r).length
    );

    return res.status(200).json({
      success: true,
      data: {
        feedbacks,
        stats: {
          total: feedbacks.length,
          averageRating: overallAvg,
          ratingDistribution
        },
        helperStats
      }
    });

  } catch (error) {
    console.error('Get Location Feedbacks Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
