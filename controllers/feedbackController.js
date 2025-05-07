import Feedback from '../models/Feedback.js';
import Booking from '../models/Booking.js';

export const getHelperFeedback = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'helper') {
    return res.redirect('/login/helper');
  }

  try {
    const feedbackList = await Feedback.find({ helper: req.session.user.id })
      .populate('seeker', 'name email');

    res.render('helperDashboard', {
      title: 'Feedback',
      content: 'partials/feedback',
      userData: req.session.user,
      feedback: feedbackList
    });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const postFeedback = async (req, res) => {
  try {
      const { bookingId, rating, review } = req.body;

      // Fetch the booking info to get seeker & helper IDs
      const booking = await Booking.findById(bookingId);

      if (!booking) {
          return res.status(404).json({ error: 'Booking not found' });
      }

      const newFeedback = new Feedback({
          seeker: booking.seeker,
          helper: booking.helper,
          feedback: review,
          rating: rating
      });

      await newFeedback.save();

      res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
  }
};
