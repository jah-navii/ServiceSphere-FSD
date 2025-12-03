import React, { useState, useEffect, useRef } from 'react';
// Assuming Chart.js is installed: npm install chart.js react-chartjs-2
import Chart from 'chart.js/auto';

// --- Mock Data simulating backend API response ---
const mockPastMonthEarnings = [
  { date: '2025-11-05', service: 'Plumbing Repair', customer: 'Alice Smith', amount: 450.00 },
  { date: '2025-11-12', service: 'Deep Cleaning', customer: 'Bob Johnson', amount: 800.00 },
  { date: '2025-11-18', service: 'Electrical Fix', customer: 'Charlie Brown', amount: 620.00 },
  { date: '2025-11-25', service: 'Maintenance', customer: 'Dana White', amount: 550.00 },
  { date: '2025-11-28', service: 'Painting', customer: 'Eve Davis', amount: 1200.00 },
];
const mockLifetimeEarnings = 15420.50;
// ------------------------------------------------

function EarningsPage() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  // State to manage earnings data
  const [earningsData] = useState({
    pastMonthEarnings: mockPastMonthEarnings,
    lifetimeEarnings: mockLifetimeEarnings,
  });

  // Calculate the total for the past month
  const pastMonthTotal = earningsData.pastMonthEarnings.reduce(
    (sum, item) => sum + item.amount, 0
  );

  // Function to initialize and destroy the Chart.js graph
  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance before creating a new one
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Prepare data for the chart (example: earnings over the last 5 services)
      const dataPoints = earningsData.pastMonthEarnings.slice(-5);
      const labels = dataPoints.map(item => `${item.date} (${item.service})`);
      const amounts = dataPoints.map(item => item.amount);

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Earnings per Service (Past Month)',
            data: amounts,
            backgroundColor: '#007ea7', // var(--cerulean)
            borderColor: '#005f73',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Earnings (Rs)'
              }
            }
          }
        }
      });
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [earningsData.pastMonthEarnings]);


  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR', // Assuming Indian Rupees (Rs) based on the EJS file
      minimumFractionDigits: 2,
    }).format(amount).replace('₹', 'Rs '); // Replace the default currency symbol with 'Rs '
  };

  return (
    <div className="content">
      <h2>Past Month Earnings</h2>
      <table className="earnings-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Customer</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody id="earnings-body">
          {earningsData.pastMonthEarnings.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.service}</td>
              <td>{item.customer}</td>
              <td>{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="total-label">Total (Past Month)</td>
            <td id="past-month-total" className="total-amount">
              {formatCurrency(pastMonthTotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Graph Section */}
      <div className="graph-container">
        {/* The canvas element is where Chart.js draws the graph */}
        <canvas id="earningsChart" ref={chartRef}></canvas>
      </div>

      <div className="lifetime-earnings">
        <h2>Lifetime Earnings</h2>
        <p>
          <span id="lifetime-total">{formatCurrency(earningsData.lifetimeEarnings)}</span>
        </p>
      </div>
    </div>
  );
}

export default EarningsPage;