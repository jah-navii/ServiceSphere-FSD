import Helper from '../models/Helper.js';
import Booking from '../models/Booking.js';
import Seeker from '../models/Seeker.js';


// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    // 1. Extract data from React payload
    const { 
        userId,        // The logged-in Seeker's ID
        helperId,      // The ID of the Helper being booked
        serviceName,   // e.g. "Plumbing"
        customerName,  // Name entered in the form
        date, 
        time, 
        address, 
        price 
    } = req.body;

    // 2. Validations
    if (!userId || !helperId || !date || !time || !address) {
        return res.status(400).json({ error: "Missing required booking details." });
    }

    // Optional: Verify Seeker exists
    const seeker = await Seeker.findById(userId);
    if (!seeker) {
        return res.status(404).json({ error: "User not found. Please login." });
    }

    // 3. Create Booking
    const newBooking = await Booking.create({
      seeker: userId,           // Link to User
      helperID: helperId,       // Link to Helper (Note: check your Schema if it's 'helper' or 'helperID')
      helperName: req.body.helperName, // Optional: store snapshot of helper name
      customerName: customerName,
      service_type: serviceName, // Map 'serviceName' to 'service_type'
      date,
      time,
      address,
      price,
      status: "Pending",        // Initial status
      paid: false
    });

    console.log("🎯 Booking created:", newBooking._id);

    // 4. Success Response
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

// GET /api/bookings?userId=... (For the Cart Page)
export const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "User ID required" });

        // Fetch bookings for this specific seeker
        const bookings = await Booking.find({ seeker: userId })
                                      .sort({ date: -1 }); // Newest first

        res.status(200).json({ success: true, bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

// Previous bookings page
export const renderPreviouslyBookedServices = async (req, res) => {

  if (!req.session.user || req.session.user.role !== "seeker") {
    return res.redirect('/login/seeker');
  }

  try {
      const userId = req.session.user.id;
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