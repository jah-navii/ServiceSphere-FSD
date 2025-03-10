// // Fetch all services
// function fetchServices() {
//     fetch('/services')
//         .then(response => response.json())
//         .then(data => displayServices(data))
//         .catch(error => console.error('Error fetching services:', error));
// }
// Fetch searched services
function fetchSearchedServices(searchTerm) {
    fetch(`/services/search?term=${searchTerm}`)
        .then(response => response.json())
        .then(data => displayServices(data))
        .catch(error => console.error('Error fetching searched services:', error));
}
// // Fetch filtered services
// function fetchFilteredServices(maxPrice, availability, type, gender) {
//     fetch(`/services/filter?maxPrice=${maxPrice}&availability=${availability}&type=${type}&gender=${gender}`)
//         .then(response => response.json())
//         .then(data => displayServices(data))
//         .catch(error => console.error('Error fetching filtered services:', error));
// }



// Display services
// function displayServices(services) {
//     const servicesList = document.getElementById("servicesList");
//     servicesList.innerHTML = "";
//     services.forEach(service => {
//         const serviceDiv = document.createElement("div");
//         serviceDiv.className = "service";
//         serviceDiv.innerHTML = `
//             <div class="service-content">
//                 <div class="service-details">
//                     <h3>${service.name}</h3>
//                     <p>₹${service.price}.00</p>
//                     <p>Availability: ${service.availability}</p>
//                     <p>Gender: ${service.gender}</p>
//                     <div class="service-rating">
//                         <span>Rating: ${service.rating}</span>
//                     </div>
//                     <button>Add to cart</button>
//                 </div>
//                 <div class="service-image">
//                     <img src="${service.image}" alt="${service.name}">
//                 </div>
//             </div>
//         `;
//         servicesList.appendChild(serviceDiv);
//     });
// }


// Search functionality
const searchButton = document.getElementById("searchButton");

if (searchButton) {
    searchButton.addEventListener("click", () => {
        const searchInput = document.getElementById("searchInput");
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
        fetchSearchedServices(searchTerm);
    });
}

// Filter functionality
document.getElementById("priceRange").addEventListener("input", function() {
    document.getElementById("priceValue").textContent = this.value;
    applyFilters();
});

// document.getElementById("availabilityFilter").addEventListener("change", applyFilters);
document.getElementById("serviceTypeFilter").addEventListener("change", applyFilters);
document.getElementById("genderFilter").addEventListener("change", applyFilters);
function applyFilters() {
    const maxPrice = parseFloat(document.getElementById("priceRange").value);
    const availabilityFilter = document.getElementById("availabilityFilter").value;
    const serviceTypeFilter = document.getElementById("serviceTypeFilter").value;
    const genderFilter = document.getElementById("genderFilter").value;

    fetchFilteredServices(maxPrice, availabilityFilter, serviceTypeFilter, genderFilter);
}




// Reset filters
document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("priceRange").value = 1500;
    document.getElementById("priceValue").textContent = 1500;
    document.getElementById("availabilityFilter").value = "all";
    document.getElementById("serviceTypeFilter").value = "all";
    document.getElementById("genderFilter").value = "all";
    fetchServices();
});


function applyFilters() {
    const maxPrice = parseFloat(document.getElementById("priceRange").value);
    const availabilityFilter = document.getElementById("availabilityFilter").value;
    const serviceTypeFilter = document.getElementById("serviceTypeFilter").value;
    const genderFilter = document.getElementById("genderFilter").value;

    fetchFilteredServices(maxPrice, availabilityFilter, serviceTypeFilter, genderFilter);
}