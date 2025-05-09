import Seeker from '../models/Seeker.js';
import Booking from '../models/Booking.js';
import Helper from '../models/Helper.js';

// GET /home — Seeker Home
export const renderHome = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'seeker') {
    return res.redirect('/login/seeker');
  }

  res.render('home', { user: req.session.user });
};

// GET /profile — Seeker Profile Page
export const getSeekerProfile = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'seeker') {
    return res.redirect('/login/seeker');
  }

  res.render('seeker_profile', { seeker: req.session.user });
};

// POST /update-seeker-profile — Seeker Profile Update
export const updateSeekerProfile = async (req, res) => {
  const { name, mobilenumber, address } = req.body;
  const seekerId = req.session.user.id;

  try {
    const seeker = await Seeker.findByIdAndUpdate(
      seekerId,
      { name, mobilenumber, address },
      { new: true }
    );

    // Update session info
    req.session.user.name = seeker.name;
    req.session.user.mobilenumber = seeker.mobilenumber;
    req.session.user.address = seeker.address;

    res.redirect('/profile');
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const showCart = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'seeker') {
    return res.redirect('/login/seeker');
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const bookings = await Booking.find({
      seeker: req.session.user.id,
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

    res.render('cart', { bookings: formattedBookings });
  } catch (err) {
    console.error("Cart Error:", err);
    res.status(500).send("Error loading cart.");
  }
};