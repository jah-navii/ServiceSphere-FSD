// Profile Form Submission
document
  .getElementById("profile-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const name = document.getElementById("name").value;
    const contact = document.getElementById("contact").value;
    const availability = document.getElementById("availability").value;
    const certifications = document.getElementById("certifications")?.files[0]; // Optional file upload

    // Get selected services
    const serviceCheckboxes = document.querySelectorAll(
      'input[name="services"]:checked'
    );
    const selectedServices = Array.from(serviceCheckboxes).map(
      (checkbox) => checkbox.value
    );

    // Create form data to send
    const formData = new FormData();
    formData.append("name", name);
    formData.append("mobilenumber", contact);
    formData.append("availability", availability);
    formData.append("services", selectedServices.join(", "));

    if (certifications) {
      formData.append("certifications", certifications);
    }

    try {
      const response = await fetch("/helper/profile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        window.location.reload(); // Refresh page to reflect changes
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile.");
    }
  });

//Schedule page js
function updateRequestStatus(requestId, status) {
  console.log(`Updating request ${requestId} to status: ${status}`);

  fetch("/helper/requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId, status }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Server response:", data);

      if (data.success) {
        document.getElementById(`status-${requestId}`).innerText = status;
        alert(`Request ${status} successfully!`);
      } else {
        alert("Failed to update request status.");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function acceptRequest(requestId) {
  const requestCard = document.querySelector(
    `.request-card[data-request-id="${requestId}"]`
  );
  const date = requestCard
    .querySelector("p:nth-child(3)")
    .textContent.split(": ")[1]; // Extract date from the request card

  const acceptedRequests =
    JSON.parse(localStorage.getItem("acceptedRequests")) || [];
  acceptedRequests.push(date);
  localStorage.setItem("acceptedRequests", JSON.stringify(acceptedRequests));

  showModal(`Request ${requestId} accepted!`);
  updateCalendarWithAcceptedRequests();
}

function rejectRequest(requestId) {
  showModal(`Request ${requestId} rejected!`);
}

// // Custom Modal Function
// function showModal(message) {
//     const modal = document.createElement('div');
//     modal.style.position = 'fixed';
//     modal.style.top = '50%';
//     modal.style.left = '50%';
//     modal.style.transform = 'translate(-50%, -50%)';
//     modal.style.backgroundColor = '#ffffff';
//     modal.style.padding = '20px';
//     modal.style.borderRadius = '8px';
//     modal.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
//     modal.style.zIndex = '1000';
//     modal.style.textAlign = 'center';

//     const modalText = document.createElement('p');
//     modalText.textContent = message;
//     modalText.style.marginBottom = '20px';

//     const closeButton = document.createElement('button');
//     closeButton.textContent = 'Close';
//     closeButton.style.backgroundColor = '#007ea7';
//     closeButton.style.color = '#ffffff';
//     closeButton.style.padding = '10px 20px';
//     closeButton.style.border = 'none';
//     closeButton.style.borderRadius = '8px';
//     closeButton.style.cursor = 'pointer';
//     closeButton.style.fontSize = '16px';
//     closeButton.style.transition = 'background-color 0.3s ease';

//     closeButton.addEventListener('click', () => {
//         document.body.removeChild(modal);
//     });

//     modal.appendChild(modalText);
//     modal.appendChild(closeButton);
//     document.body.appendChild(modal);
// }

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("availability-calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: blockedDates.map((datetime) => ({
      start: datetime,
      display: "background",
      color: "#f44336", // Red for blocked
    })),
  });

  calendar.render();
});

let pastMonthEarnings = [];
let lifetimeEarnings = 0;

// Read JSON data from DOM
const dataScript = document.getElementById("earnings-data");
if (dataScript) {
  try {
    const parsedData = JSON.parse(dataScript.textContent);
    pastMonthEarnings = parsedData.pastMonthEarnings || [];
    lifetimeEarnings = parsedData.lifetimeEarnings || 0;
  } catch (e) {
    console.error("Failed to parse earnings data:", e);
  }
}

// Function to format numbers as Indian Rupees
function formatAsIndianRupees(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Function to format numbers as Indian Rupees
function formatAsIndianRupees(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Function to populate the earnings table and calculate totals
function populateEarningsTable() {
  const earningsBody = document.getElementById("earnings-body");
  const pastMonthTotal = document.getElementById("past-month-total");
  const lifetimeTotal = document.getElementById("lifetime-total");

  if (!earningsBody || !pastMonthTotal || !lifetimeTotal) {
    // Element(s) not found on the current page, skip
    return;
  }

  let pastMonthSum = 0;

  // Populate past month earnings
  pastMonthEarnings.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${item.date}</td>
        <td>${item.service}</td>
        <td>${item.customer}</td>
        <td>${formatAsIndianRupees(item.earnings)}</td>
      `;

    earningsBody.appendChild(row);
    pastMonthSum += item.earnings;
  });

  // Display totals
  pastMonthTotal.textContent = formatAsIndianRupees(pastMonthSum);
  lifetimeTotal.textContent = formatAsIndianRupees(lifetimeEarnings);
}

// Function to create the earnings line chart
function createEarningsChart() {
  const canvas = document.getElementById("earningsChart");
  if (!canvas) {
    // Not on the earnings page, skip chart rendering
    return;
  }

  const ctx = canvas.getContext("2d");
  // Extract data for the chart
  const labels = pastMonthEarnings.map((item) => item.date);
  const earnings = pastMonthEarnings.map((item) => item.earnings);

  // Create the line chart
  new Chart(ctx, {
    type: "line", // Line chart
    data: {
      labels: labels, // Dates on the x-axis
      datasets: [
        {
          label: "Earnings (₹)",
          data: earnings, // Earnings on the y-axis
          backgroundColor: "rgba(0, 123, 255, 0.2)", // Light blue fill color
          borderColor: "rgba(0, 123, 255, 1)", // Solid blue line
          borderWidth: 2,
          pointBackgroundColor: "rgba(0, 123, 255, 1)", // Blue points
          pointBorderColor: "#fff", // White border for points
          pointRadius: 5, // Size of points
          pointHoverRadius: 7, // Size of points on hover
          fill: true, // Fill the area under the line
          tension: 0.4, // Add smooth curves (0 = straight lines, 1 = maximum curve)
        },
      ],
    },
    options: {
      responsive: true, // Make the chart responsive
      maintainAspectRatio: false, // Allow the chart to resize freely
      scales: {
        y: {
          beginAtZero: true, // Start y-axis from 0
          title: {
            display: true,
            text: "Earnings (₹)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              return `Earnings: ₹${context.raw}`;
            },
          },
        },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return; // Exit if calendar element is missing

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    // other options
  });

  calendar.render();
});

// Call the functions to populate the table and create the chart
populateEarningsTable();
createEarningsChart();
