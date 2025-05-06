document.getElementById("bookingForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const address = document.getElementById("address").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    
    alert("Your booking has been confirmed!\n\n" +
          "Address: " + address + "\n" +
          "Date: " + date + "\n" +
          "Time: " + time);
          
    document.getElementById("statusMessage").textContent = "Booking Status: Pending";
    document.getElementById("statusMessage").style.display = "block";
    document.getElementById("cancelButton").style.display = "block";
    document.getElementById("bookButton").style.display = "none";
    document.getElementById("bookingForm").reset();
});

document.getElementById("cancelButton").addEventListener("click", function() {
    if (confirm("Are you sure you want to cancel the service?")) {
        alert("Your booking has been canceled.");
        document.getElementById("statusMessage").textContent = "Booking Status: Canceled";
        document.getElementById("statusMessage").style.display = "none";
        document.getElementById("cancelButton").style.display = "none";
        document.getElementById("bookButton").style.display = "block";
    }
});
