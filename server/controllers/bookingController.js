import Helper from '../models/Helper.js';
import Booking from '../models/Booking.js';
import Seeker from '../models/Seeker.js';


// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { 
        userId,        
        helperId,      
        serviceName,   
        customerName,  
        date, 
        time, 
        address, 
        price 
    } = req.body;

    // 1. Validations
    if (!userId || !helperId || !date || !time || !address) {
        return res.status(400).json({ error: "Missing required booking details." });
    }

    const seeker = await Seeker.findById(userId);
    if (!seeker) {
        return res.status(404).json({ error: "User not found. Please login." });
    }

    // 2. Create Booking
    const newBooking = await Booking.create({
      seeker: userId,           
      
      // --- FIX IS HERE ---
      // Old: helperID: helperId, 
      // New: helper: helperId (Matches your Schema Definition)
      helper: helperId,       
      
      helperName: req.body.helperName, 
      customerName: customerName,
      service_type: serviceName, 
      date,
      time,
      address,
      price,
      status: "pending",        
      paid: false
    });

    console.log("🎯 Booking created:", newBooking._id);

    res.status(201).json({ 
        success: true, 
        message: "Booking submitted successfully", 
        bookingId: newBooking._id 
    });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Failed to submit booking." });
  }
};


// GET /api/bookings?userId=...
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Optional: Date Logic (If you only want upcoming bookings like your EJS code)
    // const today = new Date().toISOString().split("T")[0];
    
    const bookings = await Booking.find({ 
      seeker: userId,
      // Uncomment this line if you ONLY want upcoming bookings:
      // date: { $gte: today } 
    })
    .populate('helper', 'name') // Get helper's name from ID
    .sort({ date: -1 }); // Newest first

    // Format data for React (Flattening the object)
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      // Safety check in case helper was deleted
      helperName: booking.helper ? booking.helper.name : "Unknown Helper",
      serviceType: booking.service_type, // Matches 'servicetype' in Schema
      serviceName: booking.service_type, // Redundant fallback for UI
      date: booking.date,
      time: booking.time,
      address: booking.address,
      price: booking.price,
      status: booking.status,
      paid: booking.paid || false
    }));

    res.status(200).json({ success: true, bookings: formattedBookings });

  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};


// PATCH /api/bookings/:id/pay
export const payForBooking = async (req, res) => {
  try {
    // 1. Get ID from URL params (matches the route /:id/pay)
    const { id } = req.params;

    // 2. Find and Update
    const booking = await Booking.findByIdAndUpdate(
      id,
      { paid: true, status: 'Accepted' }, // Ensure it stays accepted
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    console.log("Payment successful for:", booking._id);
    
    // 3. Send JSON response (React expects JSON, not text)
    res.status(200).json({ success: true, message: "Payment successful.", booking });

  } catch (err) {
    console.error("Payment update error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Previous bookings page
export const renderPreviouslyBookedServices = async (req, res) => {

  if (!req.user || req.user.role !== "seeker") {
    return res.status(403).json({ error: 'Seeker access required' });
  }

  try {
      const userId = req.user.id;
      console.log(userId);
      
      // Get current date in the same format as the stored booking dates (DD-MM-YYYY)
      const currentDate = new Date().toISOString().split("T")[0];

      // Fetch bookings with date less than the current date
      const bookings = await Booking.find({ 
          seeker: userId, 
          date: { $lt: currentDate }
      }).populate('helper');

      // Transform the data for rendering
      const bookingData = bookings.map(booking => ({
          name: booking.helper.name,
          serviceType: booking.service_type,
          date: booking.date,
          time: booking.time,
          totalSpent: `₹${booking.price}`,
          reviews: Math.floor(Math.random() * 20) + 1, // Placeholder for now
          rating: Math.floor(Math.random() * 5) + 1, // Placeholder for now
          image: '/pics/profile-picture.png' // Placeholder for now
      }));

      console.log(bookingData);

      res.render('prevbookings', {
          bookingsData: bookingData
      });
  } catch (err) {
      console.error("Error rendering previously booked services:", err);
      res.status(500).send("Internal Server Error");
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
      const { bookingId } = req.query;
      
      if (!bookingId) return res.status(400).send("Booking ID is required.");

      const booking = await Booking.findById(bookingId).populate("helper", "name").populate("seeker", "name");

      if (!booking) return res.status(404).send("Booking not found.");

      // Pass the correct variable name
      res.render("payment", {
          bookingId: booking.id,
          serviceType: booking.service_type,
          date: booking.date,
          time: booking.time,
          price: booking.price,
          helperName: booking.helper.name
      });
  } catch (error) {
      console.error("Error loading payment page:", error);
      res.status(500).send("Internal Server Error");
  }
}

export const submitPayment = async (req, res) => {
  const { bookingId } = req.body;

  try {
      const booking = await Booking.findByIdAndUpdate(
          bookingId,
          { paid: true },
          { new: true }
      );

      if (!booking) {
          return res.status(404).send("Booking not found.");
      }

      console.log("Payment successful:", booking);
      res.status(200).send("Payment successful.");
  } catch (err) {
      console.error("Payment update error:", err);
      res.status(500).send("Internal Server Error");
  }
}

export const getReviewDetails = async (req, res) => {
  const { bookingId } = req.query;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('helper', 'name') // gets the helper's name
      .populate('seeker', 'name'); // optional, if you need it

    if (!booking) {
      return res.status(404).send("Booking not found.");
    }

    res.render('review', {
      serviceType: booking.service_type,
      helperName: booking.helper.name,
      date: booking.date,
      time: booking.time,
      price: booking.price,
      bookingId: booking._id.toString()
    });
  } catch (err) {
    console.error("Error loading review page:", err);
    res.status(500).send("Internal Server Error");
  }
}