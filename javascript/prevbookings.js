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




  nothing added to commit but untracked files present (use "git add" to track)
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git add .
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git commit -m "bookingformjs mongo"
[main 65373df] bookingformjs mongo
 1 file changed, 28 insertions(+)
 create mode 100644 javascript/bookingform.js
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd> git push origin main
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Delta compression using up to 12 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 725 bytes | 725.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To https://github.com/jah-navii/ServiceSphere-FSD.git
   24b1aa1..65373df  main -> main
PS C:\Users\jahna\acads\sem5\fdfed\servicesphere-fsd>



