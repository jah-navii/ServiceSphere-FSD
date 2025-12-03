import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './EarningsPage.module.css';

// Mock Data
const mockPastMonthEarnings = [
  { date: '2025-11-05', service: 'Plumbing Repair', customer: 'Alice Smith', amount: 450.00 },
  { date: '2025-11-12', service: 'Deep Cleaning', customer: 'Bob Johnson', amount: 800.00 },
  { date: '2025-11-18', service: 'Electrical Fix', customer: 'Charlie Brown', amount: 620.00 },
  { date: '2025-11-25', service: 'Maintenance', customer: 'Dana White', amount: 550.00 },
  { date: '2025-11-28', service: 'Painting', customer: 'Eve Davis', amount: 1200.00 },
];
const mockLifetimeEarnings = 15420.50;

function EarningsPage() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  const [earningsData] = useState({
    pastMonthEarnings: mockPastMonthEarnings,
    lifetimeEarnings: mockLifetimeEarnings,
  });

  const pastMonthTotal = earningsData.pastMonthEarnings.reduce(
    (sum, item) => sum + item.amount, 0
  );

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

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
            backgroundColor: '#007ea7',
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
              title: { display: true, text: 'Earnings (Rs)' }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [earningsData.pastMonthEarnings]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount).replace('₹', 'Rs ');
  };

  return (
    <div className={styles.content}>
      <h2 className={styles.heading}>Past Month Earnings</h2>
      
      {/* Table */}
      <table className={styles.earningsTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Customer</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
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
            <td colSpan="3" className={styles.totalLabel}>Total (Past Month)</td>
            <td className={styles.totalAmount}>
              {formatCurrency(pastMonthTotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Graph */}
      <div className={styles.graphContainer}>
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Lifetime */}
      <div className={styles.lifetimeEarnings}>
        <h2>Lifetime Earnings</h2>
        <p className={styles.lifetimeTotal}>
          <span className={styles.amountHighlight}>{formatCurrency(earningsData.lifetimeEarnings)}</span>
        </p>
      </div>
    </div>
  );
}

export default EarningsPage;