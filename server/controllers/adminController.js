import Admin from '../models/Admin.js';
import Helper from '../models/Helper.js';
import ContactMessage from '../models/ContactMessage.js';
import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Booking from '../models/Booking.js';
import Location from "../models/Location.js";

//Dealt with


// Admin Signup - converted to API
export const signupAdmin = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // 2. Check Exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ error: "Admin already exists." });
    }

    // 3. Create Admin
    const newAdmin = new Admin({
      name,
      email,
      password, // Note: In production, please hash this!
    });

    await newAdmin.save();

    // 4. Success Response
    return res.status(201).json({ message: "Admin registered successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server Error" });
  }
};

// ADMIN LOGIN - Converted to API 
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill in all fields" });
  }

  try {
    const admin = await Admin.findOne({ email, password });
    
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password!" });
    }

    // Construct User Data for Redux
    const userData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin' // Important for redirect logic
    };

    // Set Session for Server-Side Authentication
    req.session.user = userData;

    console.log('Admin logged in ✅');
    return res.status(200).json({ success: true, user: userData });

  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};


// GET /api/admin/messages
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ submittedAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// DELETE /api/admin/messages/:id
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await ContactMessage.findByIdAndDelete(id);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};


// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const helpers = await Helper.find().select('-password'); // Don't send passwords
    res.status(200).json(helpers);
  } catch (error) {
    console.error('Error fetching helpers:', error);
    res.status(500).json({ error: 'Error fetching helpers' });
  }
};

// PATCH /api/admin/users/approve
export const approveUser = async (req, res) => {
  try {
    const { helperId } = req.body;
    const helper = await Helper.findByIdAndUpdate(helperId, { approved: true }, { new: true });
    if (helper) {
      res.json({ message: 'User approved successfully', helper });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// PATCH /api/admin/users/reject
export const rejectUser = async (req, res) => {
  try {
    const { helperId } = req.body;
    const helper = await Helper.findByIdAndUpdate(helperId, { approved: false }, { new: true });
    if (helper) {
      res.json({ message: 'User rejected successfully', helper });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
};


// GET /api/admin/services-data
// Fetches Categories AND Services for the management page
export const getServiceManagementData = async (req, res) => {
  try {
    const categories = await Category.find();
    // Populate category name so we can display "Plumbing (Home Repairs)"
    const services = await Service.find().populate('category'); 
    
    res.status(200).json({ categories, services });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
};

// POST /api/admin/categories/add
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name required" });

    const newCategory = await Category.create({ name });
    res.status(201).json({ message: "Category added", category: newCategory });
  } catch (err) {
    res.status(500).json({ error: "Category already exists or server error" });
  }
};

// POST /api/admin/services/add
export const addService = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) return res.status(400).json({ error: "Name and Category required" });

    // Check if service exists in that category
    const exists = await Service.findOne({ name, category: categoryId });
    if (exists) return res.status(409).json({ error: "Service already exists in this category" });

    const newService = await Service.create({ name, category: categoryId });
    // Populate immediately so the frontend can display the category name
    await newService.populate('category');

    res.status(201).json({ message: "Service added", service: newService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add service" });
  }
};

// DELETE /api/admin/services/:id
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(200).json({ message: "Service removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
};

// DELETE /api/admin/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Optional: Check if services exist in this category before deleting?
    await Category.findByIdAndDelete(id);
    // Optional: Cascade delete services?
    await Service.deleteMany({ category: id }); 
    
    res.status(200).json({ message: "Category and associated services removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
};


// GET /api/admin/earnings-data
export const getEarningsData = async (req, res) => {
  try {
    // 1. Monthly Earnings
    const monthlyEarnings = await Booking.aggregate([
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
      {
        $group: {
          _id: "$service_type", // Ensure this field exists in your Booking model
          total: { $sum: "$price" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // 3. Daily Trends
    const dailyTrends = await Booking.aggregate([
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
      {
        $group: {
          _id: "$paid", // Boolean: true/false
          total: { $sum: "$price" }
        }
      }
    ]);

    // 5. Top Earning Helpers
    const topHelpers = await Booking.aggregate([
      {
        $lookup: {
          from: "helpers", // MongoDB collection name (lowercase, pluralized)
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
        if (curr._id === true) acc.received = curr.total; // paid: true
        else acc.pending = curr.total; // paid: false
        return acc;
      }, { received: 0, pending: 0 }),
      topHelpers: topHelpers.map(h => ({ name: h.name, amount: h.total }))
    };

    res.status(200).json(earningsData);

  } catch (error) {
    console.error("Error fetching earnings data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// GET /api/admin/locations
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 }); // Alphabetical order
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};

// POST /api/admin/locations/add
export const addLocation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Location name required" });

    const newLocation = await Location.create({ name });
    res.status(201).json({ message: "Location added", location: newLocation });
  } catch (err) {
    // Error 11000 is duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ error: "Location already exists" });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

// DELETE /api/admin/locations/:id
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ message: "Location removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
};

//Useless mostly













// Dashboard view - start of old 
export const renderDashboard = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ submittedAt: -1 }); // latest first

    res.render('adminDashboard', {
      title: 'Dashboard',
      content: 'partials/user-contact',
      messages // pass to EJS
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Failed to load dashboard');
  }
};

// User management
export const renderUsers = (req, res) => {
  res.render('adminDashboard', {
    title: 'User Management',
    content: 'partials/user-management'
  });
};

// Services management

// Render the service management page
export const renderServices = async (req, res) => {
  try {
      const services = await Service.find({});
      res.render('adminDashboard', {
          title: 'Service Management',
          content: 'partials/service-overview',
          services
      });
  } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).send('Error fetching services');
  }
};

// Add a new service
// export const addService = async (req, res) => {
//   try {
//       const { serviceName } = req.body;
//       if (!serviceName) return res.status(400).json({ message: 'Service name is required' });

//       const existingService = await Service.findOne({ name: serviceName });
//       if (existingService) return res.status(409).json({ message: 'Service already exists' });

//       const newService = new Service({ name: serviceName });
//       await newService.save();

//       res.status(201).json({ message: 'Service added successfully', service: newService });
//   } catch (error) {
//       console.error('Error adding service:', error);
//       res.status(500).json({ message: 'Error adding service' });
//   }
// };

// Remove a service
export const removeService = async (req, res) => {
  try {
      const { serviceName } = req.params;
      const result = await Service.findOneAndDelete({ name: serviceName });
      
      if (!result) return res.status(404).json({ message: 'Service not found' });

      res.status(200).json({ message: 'Service removed successfully' });
  } catch (error) {
      console.error('Error removing service:', error);
      res.status(500).json({ message: 'Error removing service' });
  }
};

// Earnings view
export const renderEarnings = async (req, res) => {

  console.log("Render earnings route hit");
    try {
        // 1. Monthly Earnings
        const monthlyEarnings = await Booking.aggregate([
            {
                $group: {
                    _id: { $substr: ["$date", 0, 7] },
                    total: { $sum: "$price" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // 2. Category-wise Earnings
        const categoryEarnings = await Booking.aggregate([
            {
                $group: {
                    _id: "$service_type",
                    total: { $sum: "$price" }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // 3. Daily Trends
        const dailyTrends = await Booking.aggregate([
            {
                $group: {
                    _id: "$date",
                    total: { $sum: "$price" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // 4. Pending vs Received
        const paymentStatus = await Booking.aggregate([
            {
                $group: {
                    _id: "$paid",
                    total: { $sum: "$price" }
                }
            }
        ]);

        // 5. Top Earning Helpers
        const topHelpers = await Booking.aggregate([
          {
              $group: {
                  _id: "$helper", // group by helper ObjectId
                  total: { $sum: "$price" }
              }
          },
          {
              $sort: { total: -1 }
          },
          {
              $limit: 5
          },
          {
              $lookup: {
                  from: "helpers", // MongoDB collection name (should match your model's collection)
                  localField: "_id", // helper id in Booking
                  foreignField: "_id", // _id in Helpers
                  as: "helperInfo"
              }
          },
          {
              $unwind: "$helperInfo"
          },
          {
              $project: {
                  _id: 0,
                  name: "$helperInfo.name",
                  total: 1
              }
          }
      ]);      

        console.log("Monthly Earnings:", monthlyEarnings);
        console.log("Category Earnings:", categoryEarnings);
        console.log("Daily Trends:", dailyTrends);
        console.log("Payment Status:", paymentStatus);
        console.log("Top Helpers:", topHelpers);

        // Prepare data for EJS
        const earningsData = {
            monthlyEarnings: monthlyEarnings.map(e => ({ month: e._id, amount: e.total })),
            categoryEarnings: categoryEarnings.map(e => ({ category: e._id, amount: e.total })),
            dailyTrends: dailyTrends.map(e => ({ date: e._id, amount: e.total })),
            paymentStatus: paymentStatus.reduce((acc, curr) => {
                if (curr._id) acc.received = curr.total;
                else acc.pending = curr.total;
                return acc;
            }, { received: 0, pending: 0 }),
            topHelpers: topHelpers.map(h => ({ name: h.name, amount: h.total }))
        };

        res.render('adminDashboard', {
            title: 'Earnings Overview',
            content: 'partials/earnings-overview',
            earningsData
        });
    } catch (error) {
        console.error("Error fetching earnings data:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Approve helper
export const approveHelper = async (req, res) => {
  try {
    await Helper.findByIdAndUpdate(req.params.id, { approved: true });
    res.sendStatus(200);
  } catch (err) {
    console.error("Approval Error:", err);
    res.sendStatus(500);
  }
};

// Reject helper
export const rejectHelper = async (req, res) => {
  try {
    await Helper.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err) {
    console.error("Rejection Error:", err);
    res.sendStatus(500);
  }
};
