document.addEventListener('DOMContentLoaded', function() {
    // Select all payment buttons
    const paymentButtons = document.querySelectorAll('.payment-btn');
    
    // Add click event listener to each payment button
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            
            // Redirect to payment page with booking ID
            window.location.href = `/payment?bookingId=${bookingId}`;
        });
    });
    
    // Sample data handling (for demonstration purposes)
    // In a real application, you would fetch this data from your backend
    function fetchBookings() {
        // You can replace this with actual API calls
        console.log('Fetching bookings data...');
        
        // Example of how you might refresh the page with new data
        // after an action (like cancellation or status update)
        function refreshBookings() {
            // In a real app, you would make an API call here
            console.log('Refreshing bookings data...');
        }
        
        // Example of how you might handle booking cancellations
        // This would be integrated with your backend
        function cancelBooking(bookingId) {
            console.log(`Cancelling booking ${bookingId}...`);
            // After successful cancellation from server
            refreshBookings();
        }
    }
    
    // Initialize the page
    fetchBookings();
});