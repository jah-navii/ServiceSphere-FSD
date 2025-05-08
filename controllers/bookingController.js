import Helper from '../models/Helper.js';
import Booking from '../models/Booking.js';
import Seeker from '../models/Seeker.js';

//get /booking booking_form page 
export const getBookingForm = async (req, res) => {
  if (!req.session.user || req.session.user.role !== "seeker") {
    return res.redirect('/login/seeker');
  }

  try {
    const service = req.query.servicetype;
    const price = req.query.price;
    const helper = await Helper.findById(req.query.helperId);
    if (!helper) return res.status(404).send("Helper not found.");

    res.render('booking_form', {
      helper: helper,
      service: service,
      price: price
    });
  } catch (err) {
    console.error("Booking Form Error:", err);
    res.status(500).send("Internal Server Error");
  }
};

//post /booking booking_form page 
export const submitBooking = async (req, res) => {
  // console.log(req.body);
  const { servicetype, helperID, date, time, address, price } = req.body;

  const today = new Date();
  const selectedDate = new Date(date);
  // if (selectedDate <= today.setHours(0, 0, 0, 0)) {
  //   return res.status(400).send("Please select a valid date.");
  // }

  try {
    const seeker = await Seeker.findById(req.session.user.id);
    if (!seeker) return res.status(404).send("Seeker not found");

  const newBooking = await Booking.create({
    seeker: seeker._id,
    service_type: servicetype,
    helper: helperID,
    date,
    time,
    address,
    status: "pending",
    price
  });
// console.log("🎯 Booking created:", newBooking);


    res.redirect('/cart'); // or bookings page
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).send("Error submitting booking!");
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