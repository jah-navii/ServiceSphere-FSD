import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Chart from 'chart.js/auto';
import styles from './EarningsPage.module.css';

function EarningsPage() {
  const { userData } = useOutletContext();
  const [earningsData, setEarningsData] = useState({
    pastMonthEarnings: [],
    lifetimeEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Get Helper ID safely
  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  // Demo data for presentation purposes
  const demoData = {
    pastMonthEarnings: [
      { date: '2026-01-28', service: 'Plumbing', customer: 'Rahul Sharma', amount: 850 },
      { date: '2026-01-25', service: 'Electrical Work', customer: 'Priya Patel', amount: 1200 },
      { date: '2026-01-22', service: 'Carpentry', customer: 'Amit Kumar', amount: 950 },
      { date: '2026-01-20', service: 'Plumbing', customer: 'Sneha Reddy', amount: 700 },
      { date: '2026-01-18', service: 'Painting', customer: 'Vikram Singh', amount: 1500 },
      { date: '2026-01-15', service: 'Electrical Work', customer: 'Anjali Gupta', amount: 800 },
      { date: '2026-01-12', service: 'Cleaning', customer: 'Rohit Mehta', amount: 600 },
      { date: '2026-01-10', service: 'Carpentry', customer: 'Neha Joshi', amount: 1100 },
      { date: '2026-01-08', service: 'Plumbing', customer: 'Karan Verma', amount: 750 },
      { date: '2026-01-05', service: 'Painting', customer: 'Pooja Nair', amount: 1300 },
    ],
    lifetimeEarnings: 24850
  };

  // 1. Fetch Earnings Data
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!helperId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/helper/earnings/${helperId}`);
        const data = await res.json();

        if (res.ok) {
          // If no data from backend, use demo data for presentation
          if (data.pastMonthEarnings && data.pastMonthEarnings.length > 0) {
            setEarningsData(data);
          } else {
            console.log('No earnings data found, showing demo data for presentation');
            setEarningsData(demoData);
          }
        } else {
          console.error("Failed to load earnings, using demo data");
          setEarningsData(demoData);
        }
      } catch (err) {
        console.error("Network error, using demo data:", err);
        setEarningsData(demoData);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [helperId]);

  // 2. Render Chart
  useEffect(() => {
    if (chartRef.current && earningsData.pastMonthEarnings.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Aggregate earnings by service type
      const serviceEarnings = {};
      earningsData.pastMonthEarnings.forEach(item => {
        if (serviceEarnings[item.service]) {
          serviceEarnings[item.service] += item.amount;
        } else {
          serviceEarnings[item.service] = item.amount;
        }
      });

      const labels = Object.keys(serviceEarnings);
      const amounts = Object.values(serviceEarnings);

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Earnings per Service',
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
              title: { display: true, text: 'Earnings (₹)' }
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
  }, [earningsData]);

  // Calculate Past Month Total
  const pastMonthTotal = earningsData.pastMonthEarnings.reduce(
    (sum, item) => sum + item.amount, 0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount).replace('₹', 'Rs ');
  };

  if (loading) return <p style={{padding:'20px'}}>Loading earnings...</p>;

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
          {earningsData.pastMonthEarnings.length === 0 ? (
            <tr><td colspan="4" style={{textAlign:'center'}}>No earnings this month</td></tr>
          ) : (
            earningsData.pastMonthEarnings.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.service}</td>
                <td>{item.customer}</td>
                <td>{formatCurrency(item.amount)}</td>
              </tr>
            ))
          )}
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
        {earningsData.pastMonthEarnings.length > 0 ? (
            <canvas ref={chartRef}></canvas>
        ) : (
            <p style={{textAlign:'center', marginTop:'50px', color:'#999'}}>No data to display graph</p>
        )}
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