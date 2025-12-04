import { emitWarning } from 'process';
import Helper from '../models/Helper.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Feedback from "../models/Feedback.js"; // Ensure you have this model


import fs from "fs"; // Needed if you want to delete old certs (optional)

// Dealt with

// GET /api/helper/profile/:id
export const getHelperProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Backend] Fetching profile for Helper ID: ${id}`);

    // 1. Find the Helper
    const helper = await Helper.findById(id).populate("category");
    
    // DEBUG LOG 1: Check if helper exists and has a category
    console.log("[Backend] Helper Document Found:", helper);

    if (!helper) {
      return res.status(404).json({ error: "Helper not found" });
    }

    if (!helper.category) {
      console.warn(`[Backend] WARNING: Helper ${helper.name} has NO Category assigned! Services list will be empty.`);
      // Return basic data even if category is missing to prevent crash
      return res.status(200).json({
        helper: helper.toObject(),
        availableServices: [] 
      });
    }

    // 2. Fetch Services for this Category
    const availableServices = await Service.find({ 
        category: helper.category._id 
    }).select("name _id"); 

    // DEBUG LOG 2: Check services found
    console.log(`[Backend] Found ${availableServices.length} services for category "${helper.category.name}"`);

    // 3. Send Response
    res.status(200).json({
      helper: {
        id: helper._id,
        name: helper.name,
        email: helper.email,
        mobilenumber: helper.mobilenumber,
        aadharnumber: helper.aadharnumber,
        address: helper.address,
        availability: helper.availability,
        category: helper.category.name, 
        categoryId: helper.category._id, 
        services: helper.services, 
        certifications: helper.certifications
      },
      availableServices: availableServices 
    });

  } catch (err) {
    console.error("[Backend] Profile Fetch Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// PUT /api/helper/profile (Multipart Form Data)
export const updateHelperProfile = async (req, res) => {
  try {
    // 1. Extract Text Fields
    const { id, name, mobilenumber, availability, address } = req.body;
    
    // 2. Handle Services (Tricky part with FormData)
    // When sending FormData, arrays often arrive as a JSON string.
    let servicesData = [];
    if (req.body.services) {
        try {
            // If it comes as a string (e.g., "[{...}]"), parse it
            servicesData = typeof req.body.services === 'string' 
                ? JSON.parse(req.body.services) 
                : req.body.services;
        } catch (e) {
            console.error("Error parsing services:", e);
            return res.status(400).json({ error: "Invalid services format" });
        }
    }

    // 3. Find Helper
    const helper = await Helper.findById(id);
    if (!helper) return res.status(404).json({ error: 'Helper not found' });

    // 4. Handle File Upload (Certification)
    let updatedCerts = [...helper.certifications];
    if (req.file) {
      // Add new file filename to array
      updatedCerts.push(req.file.filename);
    }

    // 5. Update Fields
    helper.name = name || helper.name;
    helper.mobilenumber = mobilenumber || helper.mobilenumber;
    helper.availability = availability || helper.availability;
    helper.address = address || helper.address;
    helper.certifications = updatedCerts;

    // 6. Update Services (Format for Schema)
    // The frontend sends: { serviceId, name, price }
    // The Schema expects: { serviceId, name, price }
    if (servicesData.length > 0) {
        helper.services = servicesData.map(svc => ({
            serviceId: svc.serviceId,
            name: svc.name,
            price: Number(svc.price)
        }));
    }

    await helper.save();

    // 7. Return updated data (excluding password)
    const { password, ...updatedData } = helper.toObject();
    res.status(200).json({ message: "Profile updated successfully!", user: updatedData });

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /requests/:helperId
export const getHelperRequests = async (req, res) => {
  try {
    const { helperId } = req.params;

    // FIX: Changed 'helperID' to 'helper' to match your Mongoose Schema
    const requests = await Booking.find({ helper: helperId })
                                  .sort({ date: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("Fetching Requests Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// PATCH /api/helper/requests/update
export const updateRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;
  
  const allowedStatuses = ['Accepted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      requestId,
      { status: status },
      { new: true } // Return the updated document
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/helper/schedule/:helperId
export const getHelperSchedule = async (req, res) => {
  try {
    const { helperId } = req.params;

    // Fetch only Accepted bookings
    const bookings = await Booking.find({
      helperID: helperId,
      status: 'Accepted'
    });

    // Transform into FullCalendar Event Format
    const events = bookings.map(booking => {
      // Combine Date and Time for the calendar
      // Assuming booking.date is "YYYY-MM-DD" and booking.time is "HH:mm"
      // If booking.date is already a Date object, .toISOString().split('T')[0] works
      
      let dateStr = booking.date;
      if (booking.date instanceof Date) {
          dateStr = booking.date.toISOString().split('T')[0];
      }

      return {
        id: booking._id,
        title: `Booked: ${booking.customerName}`, // Shows "Booked: John Doe" on calendar
        start: `${dateStr}T${booking.time}`, // ISO format: 2025-12-10T10:00
        allDay: false, // Set to false so it shows at specific time in TimeGrid view
        color: '#28a745', // Green color for accepted jobs
        extendedProps: {
            address: booking.address,
            price: booking.price
        }
      };
    });

    res.status(200).json(events);

  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to load schedule' });
  }
};

// GET /api/helper/earnings/:helperId
export const getHelperEarnings = async (req, res) => {
  try {
    const { helperId } = req.params;

    // 1. Fetch all 'Accepted' bookings for this helper
    // Note: In a real app, you might check 'paid: true' here. 
    // For now, we assume Accepted = Earnings.
    const bookings = await Booking.find({
      helperID: helperId, // Matches the field in Booking Model
      status: 'Accepted'
    });

    // 2. Calculate Dates
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // 3. Filter for Past Month
    const pastMonthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= oneMonthAgo && bookingDate <= now;
    });

    // 4. Format Data for Frontend
    const pastMonthEarnings = pastMonthBookings.map(b => ({
      date: new Date(b.date).toLocaleDateString(), // Format "YYYY-MM-DD" -> "MM/DD/YYYY"
      service: b.servicetype || b.serviceName,     // Handle different naming conventions
      customer: b.customerName,                    // Saved directly in booking
      amount: b.price
    }));

    // 5. Calculate Totals
    const lifetimeEarnings = bookings.reduce((total, b) => total + b.price, 0);

    res.status(200).json({
      pastMonthEarnings,
      lifetimeEarnings
    });

  } catch (err) {
    console.error("Error fetching earnings:", err);
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
};

// GET /api/helper/feedback/:helperId
export const getHelperFeedback = async (req, res) => {
  try {
    const { helperId } = req.params;

    // Fetch feedback where 'helper' matches the ID
    // Populate 'seeker' to get the name of the person who gave feedback
    const feedbackList = await Feedback.find({ helper: helperId })
      .populate('seeker', 'name') 
      .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(feedbackList);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};