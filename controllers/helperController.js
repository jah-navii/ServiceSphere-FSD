import { emitWarning } from 'process';
import Helper from '../models/Helper.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// GET /helper/profile
export const getHelperProfile = async (req, res) => {
  if (!req.session.user) return res.redirect('/login/helper');

  try {
    const helper = await Helper.findById(req.session.user.id);
    if (!helper) {
      req.session.destroy();
      return res.render('login-helper', { error: "Session expired. Please log in again." });
    }

    // Fetch all available services from the Service collection
    const availableServices = await Service.find({}, 'name').lean();
    const serviceNames = availableServices.map(service => service.name);

    const services = helper.services || [];

    res.render('helperDashboard', {
      title: 'Profile Management',
      content: 'partials/profile',
      availableServices: serviceNames, // Pass available services here
      userData: {
        ...req.session.user,
        services,
        certifications: helper.certifications || []
      }
    });

  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).send("Internal Server Error");
  }
};


// POST /helper/profile
export const updateHelperProfile = async (req, res) => {
  if (!req.session.user) return res.redirect('/login/helper');
  const { name, mobilenumber, availability, services = [], prices=[] } = req.body;
  const uploadedCert = req.file ? req.file.filename : null;
  // Get price values manually
  let formattedServices=[];
  services.forEach((service, index)=>{
    formattedServices.push(
      {
        name: service,
        price: prices[index],
      }
    )
  });
  try {
    const helper = await Helper.findById(req.session.user.id);
    if (!helper) return res.status(404).json({ message: 'Helper not found' });

    // Update certifications
    const updatedCerts = [...(helper.certifications || [])];
    if (uploadedCert) updatedCerts.push(uploadedCert);

    helper.name = name;
    helper.mobilenumber = mobilenumber;
    helper.availability = availability;
    helper.services = formattedServices;
    helper.certifications = updatedCerts;
    await helper.save();

    // Update session
    req.session.user = {
      ...req.session.user,
      name: helper.name,
      mobilenumber: helper.mobilenumber,
      availability: helper.availability,
      services: helper.services,
      certifications: helper.certifications
    };
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
      console.error("Profile Update Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
};


// GET /helper/requests
export const getHelperRequests = async (req, res) => {
  if (!req.session.user) return res.redirect('/login/helper');

  try {
    const requests = await Booking.find({ 
      helper: req.session.user.id, 
      status: 'pending' 
    }).populate('seeker');
    console.log(requests);

    res.render('helperDashboard', {
      title: 'Service Requests',
      content: 'partials/requests',
      userData: req.session.user,
      requests
    });
  } catch (err) {
    console.error("Fetching Requests Error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// POST /helper/requests/update
export const updateRequestStatus = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { requestId, status } = req.body;
  const allowedStatuses = ['Accepted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findOne({ _id: requestId, helper: req.session.user.id });
    if (!booking) {
      return res.status(403).json({ success: false, message: 'Forbidden or not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, newStatus: status });
    // res.redirect("/helper/requests");
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getHelperSchedule = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'helper') {
    return res.redirect('/login/helper');
  }

  try {
    const bookings = await Booking.find({
      helper: req.session.user.id,
      status: 'Accepted'
    });

    const blockedDates = bookings.map(booking => {
      const dateTimeStr = `${booking.date} ${booking.time}`;
      return new Date(dateTimeStr).toISOString();
    });

    res.render('helperDashboard', {
      title: 'Schedule',
      content: 'partials/schedule',
      userData: req.session.user,
      blockedDates
    });
  } catch (error) {
    console.error('Error fetching helper schedule:', error);
    res.render('helperDashboard', {
      title: 'Schedule',
      content: 'partials/schedule',
      userData: req.session.user,
      blockedDates: []
    });
  }
};