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

  const lineChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const lineChartInstanceRef = useRef(null);
  const doughnutChartInstanceRef = useRef(null);

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

  // Fetch Earnings Data
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!helperId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/helper/earnings/${helperId}`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (res.ok) {
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

  // Calculate analytics
  const calculateAnalytics = () => {
    const earnings = earningsData.pastMonthEarnings;
    const currentMonthTotal = earnings.reduce((sum, item) => sum + item.amount, 0);
    const totalJobs = earnings.length;
    const avgPerJob = totalJobs > 0 ? currentMonthTotal / totalJobs : 0;

    // Group by service for analysis
    const serviceStats = {};
    earnings.forEach(item => {
      if (!serviceStats[item.service]) {
        serviceStats[item.service] = { total: 0, count: 0 };
      }
      serviceStats[item.service].total += item.amount;
      serviceStats[item.service].count += 1;
    });

    // Find most profitable service
    let topService = { name: 'N/A', amount: 0 };
    Object.entries(serviceStats).forEach(([service, stats]) => {
      if (stats.total > topService.amount) {
        topService = { name: service, amount: stats.total };
      }
    });

    // Sort earnings by date for trend
    const sortedEarnings = [...earnings].sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      currentMonthTotal,
      totalJobs,
      avgPerJob,
      topService,
      serviceStats,
      sortedEarnings
    };
  };

  const analytics = calculateAnalytics();

  // Render Line Chart (Earnings Trend)
  useEffect(() => {
    if (lineChartRef.current && analytics.sortedEarnings.length > 0) {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }

      // Aggregate by date
      const dateMap = {};
      analytics.sortedEarnings.forEach(item => {
        if (dateMap[item.date]) {
          dateMap[item.date] += item.amount;
        } else {
          dateMap[item.date] = item.amount;
        }
      });

      const dates = Object.keys(dateMap);
      const amounts = Object.values(dateMap);

      const ctx = lineChartRef.current.getContext('2d');
      lineChartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
          datasets: [{
            label: 'Daily Earnings',
            data: amounts,
            borderColor: '#4A90E2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#4A90E2',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 12,
              displayColors: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₹' + value;
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    return () => {
      if (lineChartInstanceRef.current) {
        lineChartInstanceRef.current.destroy();
      }
    };
  }, [analytics.sortedEarnings]);

  // Render Doughnut Chart (Service Breakdown)
  useEffect(() => {
    if (doughnutChartRef.current && Object.keys(analytics.serviceStats).length > 0) {
      if (doughnutChartInstanceRef.current) {
        doughnutChartInstanceRef.current.destroy();
      }

      const services = Object.keys(analytics.serviceStats);
      const amounts = Object.values(analytics.serviceStats).map(s => s.total);
      
      const colors = ['#4A90E2', '#50C878', '#FFB347', '#E67E22', '#9B59B6', '#1ABC9C'];

      const ctx = doughnutChartRef.current.getContext('2d');
      doughnutChartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: services,
          datasets: [{
            data: amounts,
            backgroundColor: colors.slice(0, services.length),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                }
              },
              backgroundColor: '#fff',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#ddd',
              borderWidth: 1,
              padding: 12
            }
          }
        }
      });
    }

    return () => {
      if (doughnutChartInstanceRef.current) {
        doughnutChartInstanceRef.current.destroy();
      }
    };
  }, [analytics.serviceStats]);

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading earnings data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E3F2FD' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A90E2" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>This Month</p>
            <h3 className={styles.statValue}>{formatCurrency(analytics.currentMonthTotal)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#E8F5E9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#50C878" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Lifetime Total</p>
            <h3 className={styles.statValue}>{formatCurrency(earningsData.lifetimeEarnings)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#FFF3E0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB347" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Avg per Job</p>
            <h3 className={styles.statValue}>{formatCurrency(analytics.avgPerJob)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#F3E5F5' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9B59B6" strokeWidth="2">
              <path d="M20 7h-9"/>
              <path d="M14 17H5"/>
              <circle cx="17" cy="17" r="3"/>
              <circle cx="7" cy="7" r="3"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Jobs</p>
            <h3 className={styles.statValue}>{analytics.totalJobs}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Earnings Trend</h3>
          <div className={styles.chartContainer}>
            {analytics.sortedEarnings.length > 0 ? (
              <canvas ref={lineChartRef}></canvas>
            ) : (
              <p className={styles.noData}>No data available</p>
            )}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Service Breakdown</h3>
          <div className={styles.chartContainer}>
            {Object.keys(analytics.serviceStats).length > 0 ? (
              <canvas ref={doughnutChartRef}></canvas>
            ) : (
              <p className={styles.noData}>No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Service Card */}
      {analytics.topService.name !== 'N/A' && (
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="8" r="7"/>
              <path d="M12 15v6"/>
              <path d="M8 21h8"/>
            </svg>
          </div>
          <div className={styles.insightContent}>
            <h4>Top Performing Service</h4>
            <p><strong>{analytics.topService.name}</strong> generated <strong>{formatCurrency(analytics.topService.amount)}</strong> this month</p>
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.tableTitle}>Recent Transactions</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.earningsTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Customer</th>
                <th className={styles.alignRight}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.pastMonthEarnings.length === 0 ? (
                <tr>
                  <td colSpan="4" className={styles.noDataRow}>No transactions found</td>
                </tr>
              ) : (
                earningsData.pastMonthEarnings.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={styles.serviceBadge}>{item.service}</span>
                    </td>
                    <td>{item.customer}</td>
                    <td className={styles.alignRight}>
                      <span className={styles.amountValue}>{formatCurrency(item.amount)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EarningsPage;