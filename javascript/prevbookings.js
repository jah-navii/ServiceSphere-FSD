document.addEventListener("DOMContentLoaded", () => {
    const serviceList = document.getElementById("services-list");

    if (window.bookingsData.length === 0) {
        serviceList.innerHTML = "<p>No past bookings found.</p>";
        return;
    }

    window.bookingsData.forEach(service => {
        const serviceCard = document.createElement("div");
        serviceCard.classList.add("service-card");

        // Generate stars dynamically
        let filledStars = "★".repeat(service.rating);
        let outlinedStars = "☆".repeat(5 - service.rating);

        serviceCard.innerHTML = `
            <img src="${service.image}" alt="User">
            <div class="service-details">
                <div class="service-header">
                    <h2>${service.name}</h2>
                    <p class="rating">
                        <span class="star filled">${filledStars}</span>
                        <span class="star outlined">${outlinedStars}</span>
                        <span style="font-size:12px; color:#555;">(${service.rating} Ratings)</span>
                    </p>
                </div>
                <p class="details"><strong>Service:</strong> ${service.serviceType}</p>
                <p class="details"><strong>Date:</strong> ${service.date} | <strong>Time:</strong> ${service.time}</p>
                <p class="details"><strong>Total Spent:</strong> ${service.totalSpent} | <strong>Reviews:</strong> ${service.reviews}</p>
                <button class="review-button">Review</button>
            </div>
        `;

        serviceList.appendChild(serviceCard);
    });
});
