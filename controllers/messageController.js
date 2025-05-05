import ContactMessage from "../models/ContactMessage.js";

//Getting admin dashboard 
export const getAdminDashboard = async (req, res) => {
    try {
      const messages = await ContactMessage.find().sort({ submittedAt: -1 });
      res.render('adminDashboard', {
        title: 'Dashboard',
        content: 'partials/user-contact',
        messages // this will be used inside the partial
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error loading dashboard');
    }
}

// Submitting contact details 
export const submitContactForm = async (req, res) => {
    try {
      await ContactMessage.create({
        name: req.body.name,
        email: req.body.email,
        adminId: req.body.adminId,
        phone: req.body.phone,
        issueType: req.body.issueType,
        message: req.body.message
      });
      res.redirect('/contact'); // or any route with your contact form

      console.log("Sent");
    } catch (error) {
      console.error('Error saving contact message:', error);
      res.status(500).send('Failed to save message');
    }
}

//Deleting messages in admin dashboard 
export const deleteMessages = async (req, res) => {
  const { messageId } = req.body; // Get the message ID from the request body

  try {
      const result = await ContactMessage.findByIdAndDelete(messageId);
      
      if (result) {
          res.status(200).json({ message: 'Message deleted successfully' });
      } else {
          res.status(404).json({ message: 'Message not found' });
      }
  } catch (err) {
      console.error('Error deleting message:', err);
      res.status(500).json({ message: 'Failed to delete message' });
  }
}