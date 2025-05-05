import Booking from '../models/Booking.js';
import Seeker from '../models/Seeker.js'; // Assuming customer name is here
import mongoose from 'mongoose';

export const getHelperEarnings = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login/helper');
  }

  console.log(req.session.user);

  const helperId = req.session.user.id;
  console.log(helperId);
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  try {
    // Fetch all completed and paid bookings for the helper
    const bookings = await Booking.find({
      helper: helperId,
      paid: true,
      status: 'Accepted',
    }).populate('seeker'); // Populate customer name

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const pastMonthBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= oneMonthAgo && bookingDate <= now;
    });


    console.log(pastMonthBookings);

    const pastMonthEarnings = pastMonthBookings.map(b => ({
      date: b.date,
      service: b.service_type,
      customer: b.seeker.name, // Ensure `name` exists in seeker model
      earnings: b.price
    }));

    const lifetimeEarnings = bookings.reduce((total, b) => total + b.price, 0);

    console.log(pastMonthEarnings);
    console.log(lifetimeEarnings);

    res.render('helperDashboard', {
      title: 'Earnings',
      content: 'partials/earnings',
      userData: req.session.user,
      pastMonthEarnings,
      lifetimeEarnings
    });

  } catch (err) {
    console.error("Error fetching earnings:", err);
    res.render('helperDashboard', {
      title: 'Earnings',
      content: 'partials/earnings',
      userData: req.session.user,
      pastMonthEarnings: [],
      lifetimeEarnings: 0
    });
  }
};
