import Feedback from '../models/Feedback.js';
import Booking from '../models/Booking.js';


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
