// === Fetch and Display Users ===
async function fetchUsers() {
    try {
      const response = await fetch('/admin/users');
      const users = await response.json();
  
      const userList = document.getElementById('user-list');
      userList.innerHTML = users.map(user => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.contact}</td>
          <td>${user.services.join(', ')}</td>
          <td>
            ${user.certification ? `<a href="${user.certification}" target="_blank">View</a>` : 'No File'}
          </td>
          <td>
            ${user.approved 
              ? `<span class="approved">Approved ✅</span>` 
              : `
                <button onclick="approveUser('${user.id}')">Approve</button>
                <button onclick="rejectUser('${user.id}')">Reject</button>
              `}
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  
  async function approveUser(helperId) {
    fetch(`/admin/users/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helperId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'User approved successfully') {
            // Reload the page to reflect the changes
            window.location.reload();
        } else {
            alert('Failed to approve user.');
        }
    })
    .catch(err => console.error('Error approving user:', err));
}
  
async function rejectUser(helperId) {
  fetch(`/admin/users/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helperId })
  })
  .then(res => res.json())
  .then(data => {
      if (data.message === 'User rejected successfully') {
          // Reload the page to reflect the changes
          window.location.reload();
      } else {
          alert('Failed to reject user.');
      }
  })
  .catch(err => console.error('Error rejecting user:', err));
}
  
  // === Manage Services ===
  async function fetchServices() {
    const response = await fetch('/admin/services');
    const services = await response.json();
  
    const serviceList = document.getElementById('service-list');
    serviceList.innerHTML = services.map(service => `
      <li>
        <span>${service}</span>
        <button onclick="removeService('${service}')">Remove</button>
      </li>
    `).join('');
  }
  
  function addService() {
    const serviceName = document.getElementById('new-service').value.trim();
    if (!serviceName) return alert('Please enter a service name.');

    fetch('/admin/services/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serviceName })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Service added successfully') {
            const ul = document.getElementById('service-list');
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${data.service.name}</span>
                <button onclick="removeService('${data.service.name}')">Remove</button>
            `;
            ul.appendChild(li);
            document.getElementById('new-service').value = '';
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.error('Error adding service:', err));
}
  
function removeService(serviceName) {
  fetch(`/admin/services/${serviceName}`, {
      method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
      if (data.message === 'Service removed successfully') {
          const items = document.querySelectorAll('#service-list li');
          items.forEach(item => {
              if (item.querySelector('span').textContent === serviceName) {
                  item.remove();
              }
          });
      } else {
          alert(data.message);
      }
  })
  .catch(err => console.error('Error removing service:', err));
}
  
  // === Earnings Chart ===
  async function fetchEarnings() {
    const response = await fetch('/admin/earnings');
    const { totalEarnings, monthlyEarnings } = await response.json();
  
    document.getElementById('total-earnings').textContent = totalEarnings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  
    const ctx = document.getElementById('earningsChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyEarnings.map(e => e.month),
        datasets: [{
          label: 'Earnings (₹)',
          data: monthlyEarnings.map(e => e.amount),
          borderColor: '#007ea7',
          backgroundColor: 'rgba(0,126,167,0.2)',
          fill: true
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  