import Admin from '../models/Admin.js';
import Helper from '../models/Helper.js';
import Seeker from '../models/Seeker.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Location from '../models/Location.js';
import ContactMessage from '../models/ContactMessage.js';
import Feedback from '../models/Feedback.js';
import ServiceRequest from '../models/ServiceRequest.js';
import { getOrSet } from '../utils/cache.js';

/**
 * Administrator Dashboard - Overview of entire platform
 * GET /api/administrator/dashboard
 */
export const getAdministratorDashboard = async (req, res) => {
  try {
    // Get counts of all entities
    const totalAdmins = await Admin.countDocuments();
    const totalHelpers = await Helper.countDocuments();
    const totalSeekers = await Seeker.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalLocations = await Location.countDocuments();
    const pendingHelpers = await Helper.countDocuments({ approved: false });
    const approvedHelpers = await Helper.countDocuments({ approved: true });

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('helper', 'name email')
      .populate('seeker', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get platform statistics
    const completedBookings = await Booking.countDocuments({ 
      paid: true,
      date: { $lt: new Date().toISOString().split('T')[0] }
    });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'rejected' });

    // Calculate total revenue from paid bookings via aggregate (avoids full scan in JS)
    const revenueAgg = await Booking.aggregate([
      { $match: { paid: true } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAdmins,
          totalHelpers,
          totalSeekers,
          totalBookings,
          totalServices,
          totalCategories,
          totalLocations,
          totalUsers: totalHelpers + totalSeekers
        },
        helpers: {
          total: totalHelpers,
          approved: approvedHelpers,
          pending: pendingHelpers
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          recent: recentBookings
        },
        revenue: {
          total: totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Administrator Dashboard Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
};

/**
 * Get all users (Helpers, Seekers, Admins)
 * GET /api/administrator/users/all?role=helpers&page=1&limit=50
 */
export const getAllUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(500, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;
    const role  = req.query.role || 'all';

    const [helpers, seekers, moderators, counts] = await Promise.all([
      (role === 'all' || role === 'helpers')
        ? Helper.find().populate('location', 'name').populate('category', 'name')
            .select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
        : [],
      (role === 'all' || role === 'seekers')
        ? Seeker.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
        : [],
      (role === 'all' || role === 'moderators')
        ? Admin.find({ role: 'moderator' }).populate('assignedLocation', 'name')
            .select('-password').lean()
        : [],
      Promise.all([
        Helper.countDocuments(),
        Seeker.countDocuments(),
        Admin.countDocuments({ role: 'moderator' }),
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        helpers,
        seekers,
        moderators,
        counts: {
          helpers:    counts[0],
          seekers:    counts[1],
          moderators: counts[2],
          total:      counts[0] + counts[1] + counts[2],
        },
        pagination: { page, limit },
      },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

/**
 * Get all bookings with detailed information
 * GET /api/administrator/bookings/all?page=1&limit=50&status=pending
 */
export const getAllBookings = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(200, parseInt(req.query.limit) || 50);
    const skip   = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const statsKey = `admin:bookings:stats${req.query.status ? ':' + req.query.status : ''}`;
    const [bookings, agg] = await Promise.all([
      Booking.find(filter)
        .populate('helper', 'name email mobilenumber category')
        .populate('seeker', 'name email mobilenumber address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      getOrSet(statsKey, 30, () => Booking.aggregate([
        ...(filter.status ? [{ $match: filter }] : []),
        { $group: {
          _id: null,
          total:       { $sum: 1 },
          pending:     { $sum: { $cond: [{ $eq: ['$status', 'pending']     }, 1, 0] } },
          confirmed:   { $sum: { $cond: [{ $eq: ['$status', 'confirmed']   }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed:   { $sum: { $cond: [{ $eq: ['$status', 'completed']   }, 1, 0] } },
          cancelled:   { $sum: { $cond: [{ $eq: ['$status', 'cancelled']   }, 1, 0] } },
          totalRevenue:{ $sum: { $cond: ['$paid', '$price', 0] } },
        }},
      ])),
    ]);
    const [agg0] = agg;

    const stats = agg0
      ? { total: agg0.total, pending: agg0.pending, confirmed: agg0.confirmed,
          in_progress: agg0.in_progress, completed: agg0.completed,
          cancelled: agg0.cancelled, totalRevenue: agg0.totalRevenue }
      : { total: 0, pending: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0, totalRevenue: 0 };

    res.status(200).json({
      success: true,
      data: {
        bookings,
        stats,
        pagination: { page, limit, total: stats.total, pages: Math.ceil(stats.total / limit) },
      },
    });
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

/**
 * Get platform activity log
 * GET /api/administrator/activity
 */
export const getPlatformActivity = async (req, res) => {
  try {
    // Get recent activities from different collections
    const recentHelpers = await Helper.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt approved');

    const recentSeekers = await Seeker.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('helper', 'name')
      .populate('seeker', 'name');

    const recentMessages = await ContactMessage.find()
      .sort({ submittedAt: -1 })
      .limit(5);

    // Create activity timeline
    const activities = [];

    recentHelpers.forEach(helper => {
      activities.push({
        type: 'helper_registration',
        timestamp: helper.createdAt,
        description: `New helper registered: ${helper.name}`,
        data: helper
      });
    });

    recentSeekers.forEach(seeker => {
      activities.push({
        type: 'seeker_registration',
        timestamp: seeker.createdAt,
        description: `New seeker registered: ${seeker.name}`,
        data: seeker
      });
    });

    recentBookings.forEach(booking => {
      activities.push({
        type: 'booking_created',
        timestamp: booking.createdAt,
        description: `Booking created by ${booking.seeker?.name} for ${booking.helper?.name}`,
        data: booking
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, 20),
        recentMessages
      }
    });
  } catch (error) {
    console.error('Get Platform Activity Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch activity' 
    });
  }
};

/**
 * Get platform analytics
 * GET /api/administrator/analytics
 */
export const getPlatformAnalytics = async (req, res) => {
  try {
    // User growth analytics
    const userGrowth = await Promise.all([
      Helper.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Seeker.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Booking trends
    const bookingTrends = await Booking.aggregate([
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // Revenue by month - using paid bookings with past dates
    const allBookingsForRevenue = await Booking.find({}).sort({ createdAt: 1 });
    const revenueByMonth = allBookingsForRevenue
      .filter(b => {
        const bookingDate = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return b.paid === true && bookingDate < today;
      })
      .reduce((acc, booking) => {
        const month = new Date(booking.createdAt).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { _id: month, revenue: 0, bookings: 0 };
        }
        acc[month].revenue += booking.price || 0;
        acc[month].bookings += 1;
        return acc;
      }, {});
    
    const revenueByMonthArray = Object.values(revenueByMonth).sort((a, b) => 
      a._id.localeCompare(b._id)
    );

    // Category popularity
    const categoryStats = await Helper.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          helperCount: { $sum: 1 }
        }
      },
      { $sort: { helperCount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth: {
          helpers: userGrowth[0],
          seekers: userGrowth[1]
        },
        bookingTrends,
        revenueByMonth: revenueByMonthArray,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get Platform Analytics Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    });
  }
};

/**
 * Get system health and statistics
 * GET /api/administrator/system-health
 */
export const getSystemHealth = async (req, res) => {
  try {
    const dbStats = {
      helpers: await Helper.estimatedDocumentCount(),
      seekers: await Seeker.estimatedDocumentCount(),
      bookings: await Booking.estimatedDocumentCount(),
      admins: await Admin.estimatedDocumentCount(),
      services: await Service.estimatedDocumentCount(),
      categories: await Category.estimatedDocumentCount(),
      locations: await Location.estimatedDocumentCount()
    };

    // Get recent errors or issues (you can enhance this based on your error logging)
    const recentIssues = {
      pendingApprovals: await Helper.countDocuments({ approved: false }),
      incompleteBookings: await Booking.countDocuments({ status: 'pending' }),
      unreadMessages: await ContactMessage.countDocuments({ read: { $ne: true } })
    };

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        database: dbStats,
        issues: recentIssues,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Get System Health Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch system health',
      status: 'unhealthy'
    });
  }
};

/**
 * Toggle suspend/unsuspend a Helper or Seeker - Administrator only
 * PATCH /api/administrator/users/:userType/:id/suspend
 */
export const suspendUser = async (req, res) => {
  try {
    const { userType, id } = req.params;

    let user;
    switch (userType) {
      case 'helper':
        user = await Helper.findById(id);
        break;
      case 'seeker':
        user = await Seeker.findById(id);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid user type. Only helpers and seekers can be suspended.' 
        });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    user.suspended = !user.suspended;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: `${userType} ${user.suspended ? 'suspended' : 'unsuspended'} successfully`,
      suspended: user.suspended
    });
  } catch (error) {
    console.error('Suspend User Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user status' 
    });
  }
};

// ==================== MODERATOR MANAGEMENT ====================

/**
 * Get all moderator applications
 * GET /api/administrator/moderator-applications
 */
export const getModeratorApplications = async (req, res) => {
  try {
    const { status } = req.query; // Filter by status: pending, active, rejected

    const filter = { role: 'moderator' };
    if (status) {
      filter.status = status;
    }

    const applications = await Admin.find(filter)
      .populate('assignedLocation')
      .populate('approvedBy', 'name email')
      .sort({ applicationDate: -1 });

    const stats = {
      pending: await Admin.countDocuments({ role: 'moderator', status: 'pending' }),
      active: await Admin.countDocuments({ role: 'moderator', status: 'active' }),
      rejected: await Admin.countDocuments({ role: 'moderator', status: 'rejected' }),
      suspended: await Admin.countDocuments({ role: 'moderator', status: 'suspended' })
    };

    res.status(200).json({
      success: true,
      data: {
        applications,
        stats
      }
    });
  } catch (error) {
    console.error('Get Moderator Applications Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch moderator applications' 
    });
  }
};

/**
 * Approve moderator application
 * PATCH /api/administrator/moderator-applications/:id/approve
 */
export const approveModerator = async (req, res) => {
  try {
    const { id } = req.params;
    const administratorId = req.user.id;

    const moderator = await Admin.findById(id);

    if (!moderator || moderator.role !== 'moderator') {
      return res.status(404).json({
        success: false,
        error: 'Moderator application not found'
      });
    }

    if (moderator.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `This application has already been ${moderator.status}`
      });
    }

    moderator.status = 'active';
    moderator.approvedBy = administratorId;
    moderator.approvedDate = new Date();
    await moderator.save();

    // Use the location they chose during signup
    if (moderator.assignedLocation) {
      await Location.findByIdAndUpdate(moderator.assignedLocation, {
        moderator: moderator._id,
        status: 'active'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Moderator approved successfully',
      data: moderator
    });
  } catch (error) {
    console.error('Approve Moderator Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve moderator'
    });
  }
};

/**
 * Reject moderator application
 * PATCH /api/administrator/moderator-applications/:id/reject
 */
export const rejectModerator = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const moderator = await Admin.findById(id);
    
    if (!moderator || moderator.role !== 'moderator') {
      return res.status(404).json({ 
        success: false, 
        error: 'Moderator application not found' 
      });
    }

    if (moderator.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: `This application has already been ${moderator.status}` 
      });
    }

    // Update moderator status
    moderator.status = 'rejected';
    moderator.rejectionReason = reason || 'Application rejected by administrator';
    await moderator.save();

    res.status(200).json({
      success: true,
      message: 'Moderator application rejected',
      data: moderator
    });
  } catch (error) {
    console.error('Reject Moderator Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject moderator' 
    });
  }
};

/**
 * Suspend moderator
 * PATCH /api/administrator/moderators/:id/suspend
 */
export const suspendModerator = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const moderator = await Admin.findById(id);
    
    if (!moderator || moderator.role !== 'moderator') {
      return res.status(404).json({ 
        success: false, 
        error: 'Moderator not found' 
      });
    }

    moderator.status = 'suspended';
    moderator.rejectionReason = reason || 'Suspended by administrator';
    await moderator.save();

    // Update location status to pending_moderator
    if (moderator.assignedLocation) {
      await Location.findByIdAndUpdate(moderator.assignedLocation, {
        moderator: null,
        status: 'pending_moderator'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Moderator suspended successfully',
      data: moderator
    });
  } catch (error) {
    console.error('Suspend Moderator Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to suspend moderator' 
    });
  }
};

/**
 * Get all locations with moderator info
 * GET /api/administrator/locations-with-moderators
 */
export const getLocationsWithModerators = async (req, res) => {
  try {
    const locations = await Location.find()
      .populate('moderator', 'name email phone status')
      .sort({ name: 1 });

    const stats = {
      total: locations.length,
      withModerator: locations.filter(l => l.moderator && l.status === 'active').length,
      pendingModerator: locations.filter(l => l.status === 'pending_moderator').length,
      inactive: locations.filter(l => l.status === 'inactive').length
    };

    res.status(200).json({
      success: true,
      data: {
        locations,
        stats
      }
    });
  } catch (error) {
    console.error('Get Locations with Moderators Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch locations' 
    });
  }
};

/**
 * Assign moderator to location
 * PATCH /api/administrator/locations/:locationId/assign-moderator
 */
export const assignModeratorToLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { moderatorId } = req.body;

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ 
        success: false, 
        error: 'Location not found' 
      });
    }

    const moderator = await Admin.findById(moderatorId);
    if (!moderator || moderator.role !== 'moderator') {
      return res.status(404).json({ 
        success: false, 
        error: 'Moderator not found' 
      });
    }

    // Check if moderator is already assigned to another location
    if (moderator.assignedLocation && moderator.assignedLocation.toString() !== locationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Moderator is already assigned to another location' 
      });
    }

    // Update location
    location.moderator = moderatorId;
    location.status = 'active';
    await location.save();

    // Update moderator
    moderator.assignedLocation = locationId;
    if (moderator.status === 'pending') {
      moderator.status = 'active';
    }
    await moderator.save();

    res.status(200).json({
      success: true,
      message: 'Moderator assigned to location successfully',
      data: { location, moderator }
    });
  } catch (error) {
    console.error('Assign Moderator Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to assign moderator' 
    });
  }
};

// ==================== CATEGORIES & SERVICES MANAGEMENT ====================

/**
 * Get all categories with their services
 * GET /api/administrator/categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        const services = await Service.find({ category: category._id });
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          image: category.image,
          servicesCount: services.length,
          services,
          createdAt: category.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithServices
    });
  } catch (error) {
    console.error('Get All Categories Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
};

/**
 * Create a new category
 * POST /api/administrator/categories
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category name is required' 
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category already exists' 
      });
    }

    const category = await Category.create({ name, description, image });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create category' 
    });
  }
};

/**
 * Update a category
 * PATCH /api/administrator/categories/:id
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          error: 'Category name already exists' 
        });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update category' 
    });
  }
};

/**
 * Delete a category
 * DELETE /api/administrator/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    // Check if category has services
    const servicesCount = await Service.countDocuments({ category: id });
    if (servicesCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot delete category with ${servicesCount} services. Delete services first.` 
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete category' 
    });
  }
};

/**
 * Create a new service under a category
 * POST /api/administrator/services
 */
export const createService = async (req, res) => {
  try {
    const { name, category, isActive } = req.body;

    if (!name || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Service name and category are required' 
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    const existingService = await Service.findOne({ name, category });
    if (existingService) {
      return res.status(400).json({ 
        success: false, 
        error: 'Service already exists in this category' 
      });
    }

    const service = await Service.create({ name, category, isActive });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create Service Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create service' 
    });
  }
};

/**
 * Update a service
 * PATCH /api/administrator/services/:id
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service not found' 
      });
    }

    if (name && name !== service.name) {
      const existingService = await Service.findOne({ 
        name, 
        category: service.category 
      });
      if (existingService) {
        return res.status(400).json({ 
          success: false, 
          error: 'Service name already exists in this category' 
        });
      }
      service.name = name;
    }

    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update Service Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update service' 
    });
  }
};

/**
 * Delete a service
 * DELETE /api/administrator/services/:id
 */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service not found' 
      });
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete Service Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete service' 
    });
  }
}

// ==================== LOCATION MANAGEMENT ====================

/**
 * Get all locations
 * GET /api/administrator/locations
 */
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find()
      .populate('moderator', 'name email')
      .sort({ name: 1 });

    // Count helpers and moderators per location
    const locationsWithCounts = await Promise.all(
      locations.map(async (location) => {
        const helpersCount = await Helper.countDocuments({ location: location._id });
        return {
          _id: location._id,
          name: location.name,
          city: location.city,
          state: location.state,
          status: location.status,
          moderator: location.moderator,
          helpersCount,
          createdAt: location.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: locationsWithCounts
    });
  } catch (error) {
    console.error('Get All Locations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
};

/**
 * Create a new location
 * POST /api/administrator/locations
 */
export const createLocation = async (req, res) => {
  try {
    const { name, city, state } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Location name is required'
      });
    }

    // Check if location with same name already exists
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        error: 'Location with this name already exists'
      });
    }

    const location = await Location.create({
      name,
      city: city || '',
      state: state || '',
      status: 'pending_moderator'
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });
  } catch (error) {
    console.error('Create Location Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create location'
    });
  }
};

/**
 * Update a location
 * PATCH /api/administrator/locations/:id
 */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, state, status } = req.body;

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== location.name) {
      const existingLocation = await Location.findOne({ name });
      if (existingLocation) {
        return res.status(400).json({
          success: false,
          error: 'Location name already exists'
        });
      }
      location.name = name;
    }

    if (city !== undefined) location.city = city;
    if (state !== undefined) location.state = state;
    if (status !== undefined) location.status = status;

    await location.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });
  } catch (error) {
    console.error('Update Location Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
};

/**
 * Delete a location
 * DELETE /api/administrator/locations/:id
 */
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    // Check if any helpers are assigned to this location
    const helpersCount = await Helper.countDocuments({ location: id });
    if (helpersCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete location. ${helpersCount} helper(s) are assigned to this location.`
      });
    }

    // Check if any moderators are assigned to this location
    const moderatorsCount = await Admin.countDocuments({ 
      assignedLocation: id,
      role: 'moderator'
    });
    if (moderatorsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete location. ${moderatorsCount} moderator(s) are assigned to this location.`
      });
    }

    await Location.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete Location Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete location'
    });
  }
};

// ==================== FEEDBACK MANAGEMENT ====================

/**
 * Get all feedbacks
 * GET /api/administrator/feedbacks
 */
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('seeker', 'name email phone')
      .populate('helper', 'name email phone category')
      .populate({
        path: 'helper',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .sort({ date: -1 });

    // Calculate stats
    const stats = {
      total: feedbacks.length,
      averageRating: feedbacks.length > 0 
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : 0,
      ratingDistribution: {
        5: feedbacks.filter(f => f.rating === 5).length,
        4: feedbacks.filter(f => f.rating === 4).length,
        3: feedbacks.filter(f => f.rating === 3).length,
        2: feedbacks.filter(f => f.rating === 2).length,
        1: feedbacks.filter(f => f.rating === 1).length
      }
    };

    res.status(200).json({
      success: true,
      data: {
        feedbacks,
        stats
      }
    });
  } catch (error) {
    console.error('Get All Feedbacks Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedbacks'
    });
  }
};

/**
 * Delete a feedback
 * DELETE /api/administrator/feedbacks/:id
 */
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback'
    });
  }
};

/**
 * Cleanup orphaned records (feedbacks, bookings, service requests referencing deleted users)
 * DELETE /api/administrator/cleanup/orphans
 */
export const cleanupOrphans = async (req, res) => {
  try {
    const helperIds = await Helper.distinct('_id');
    const seekerIds = await Seeker.distinct('_id');

    const orphanFilter = {
      $or: [
        { helper: { $nin: helperIds } },
        { seeker: { $nin: seekerIds } }
      ]
    };

    const [feedbackResult, bookingResult, serviceRequestResult] = await Promise.all([
      Feedback.deleteMany(orphanFilter),
      Booking.deleteMany(orphanFilter),
      ServiceRequest.deleteMany(orphanFilter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Orphaned records deleted',
      deleted: {
        feedbacks: feedbackResult.deletedCount,
        bookings: bookingResult.deletedCount,
        serviceRequests: serviceRequestResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Cleanup Orphans Error:', error);
    res.status(500).json({ success: false, error: 'Cleanup failed' });
  }
};
