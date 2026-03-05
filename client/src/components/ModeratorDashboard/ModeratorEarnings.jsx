import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import styles from "./ModeratorEarnings.module.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ModeratorEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/moderator/earnings-data", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <div className={styles.loading}>Loading Analytics...</div>;
  
  // TODO: Remove static data once real bookings exist
  const staticData = {
    monthlyEarnings: [
      { month: '2024-01', amount: 45000 },
      { month: '2024-02', amount: 52000 },
      { month: '2024-03', amount: 48000 },
      { month: '2024-04', amount: 61000 },
      { month: '2024-05', amount: 58000 },
      { month: '2024-06', amount: 67000 }
    ],
    categoryEarnings: [
      { category: 'Plumbing', amount: 85000 },
      { category: 'Electrical', amount: 72000 },
      { category: 'Cleaning', amount: 63000 },
      { category: 'Carpentry', amount: 48000 },
      { category: 'Painting', amount: 35000 }
    ],
    dailyTrends: [
      { date: '2024-06-01', amount: 2100 },
      { date: '2024-06-02', amount: 1800 },
      { date: '2024-06-03', amount: 2400 },
      { date: '2024-06-04', amount: 2200 },
      { date: '2024-06-05', amount: 1900 },
      { date: '2024-06-06', amount: 2600 },
      { date: '2024-06-07', amount: 2300 },
      { date: '2024-06-08', amount: 2000 },
      { date: '2024-06-09', amount: 2500 },
      { date: '2024-06-10', amount: 2100 },
      { date: '2024-06-11', amount: 2700 },
      { date: '2024-06-12', amount: 2400 },
      { date: '2024-06-13', amount: 2200 },
      { date: '2024-06-14', amount: 2800 }
    ],
    paymentStatus: { received: 250000, pending: 81000 },
    topHelpers: [
      { name: 'Rajesh Kumar', amount: 45000 },
      { name: 'Amit Sharma', amount: 38000 },
      { name: 'Priya Singh', amount: 32000 },
      { name: 'Deepak Verma', amount: 28000 },
      { name: 'Neha Gupta', amount: 24000 }
    ]
  };

  // Use static data if no real data available (check if arrays are empty)
  const hasRealData = data && 
    data.monthlyEarnings && 
    data.monthlyEarnings.length > 0;
  
  const useData = hasRealData ? data : staticData;

  // Ensure all data properties exist with defaults
  const monthlyEarnings = useData.monthlyEarnings || [];
  const categoryEarnings = useData.categoryEarnings || [];
  const dailyTrends = useData.dailyTrends || [];
  const paymentStatus = useData.paymentStatus || { received: 0, pending: 0 };
  const topHelpers = useData.topHelpers || [];

  // Calculate summary metrics
  const totalEarnings = monthlyEarnings.reduce((sum, e) => sum + e.amount, 0);
  const totalBookings = dailyTrends.length;
  const averageBookingValue = totalBookings > 0 ? totalEarnings / totalBookings : 0;
  const pendingPayments = paymentStatus.pending || 0;
  const receivedPayments = paymentStatus.received || 0;
  const conversionRate = totalEarnings > 0 ? ((receivedPayments / totalEarnings) * 100).toFixed(1) : 0;

  // --- CHART CONFIGURATIONS ---

  // 1. Monthly Earnings (Bar)
  const monthlyData = {
    labels: monthlyEarnings.map((e) => e.month),
    datasets: [
      {
        label: "Earnings (₹)",
        data: monthlyEarnings.map((e) => e.amount),
        backgroundColor: "rgba(0, 126, 167, 0.8)",
        borderColor: "#007ea7",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // 2. Categories (Doughnut)
  const categoryData = {
    labels: categoryEarnings.map((e) => e.category),
    datasets: [
      {
        data: categoryEarnings.map((e) => e.amount),
        backgroundColor: [
          "#007ea7",
          "#00a8cc",
          "#00c9cc",
          "#4caf50",
          "#66bb6a",
          "#81c784",
        ],
        borderWidth: 3,
        borderColor: "#fff",
      },
    ],
  };

  const categoryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
      },
    },
  };

  // 3. Daily Trends (Line)
  const dailyData = {
    labels: dailyTrends.slice(-14).map((e) => e.date),
    datasets: [
      {
        label: "Daily Earnings (₹)",
        data: dailyTrends.slice(-14).map((e) => e.amount),
        borderColor: "#007ea7",
        backgroundColor: "rgba(0, 126, 167, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#007ea7",
        borderWidth: 3,
      },
    ],
  };

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // 4. Payment Status (Doughnut)
  const paymentData = {
    labels: ["Received", "Pending"],
    datasets: [
      {
        data: [receivedPayments, pendingPayments],
        backgroundColor: ["#4caf50", "#ff9800"],
        borderWidth: 3,
        borderColor: "#fff",
      },
    ],
  };

  const paymentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: { size: 12 },
          usePointStyle: true,
        },
      },
    },
  };

  // 5. Top Helpers (Horizontal Bar)
  const topHelpersData = {
    labels: topHelpers.map((h) => h.name),
    datasets: [
      {
        label: "Earnings (₹)",
        data: topHelpers.map((h) => h.amount),
        backgroundColor: "rgba(0, 126, 167, 0.8)",
        borderColor: "#007ea7",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const topHelpersOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Location Earnings Analytics</h1>
        <p className={styles.pageSubtitle}>Financial overview for your location</p>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>₹</div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardValue}>₹{totalEarnings.toLocaleString()}</h3>
            <p className={styles.cardLabel}>Total Earnings</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>#</div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardValue}>{totalBookings}</h3>
            <p className={styles.cardLabel}>Total Bookings</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>₹</div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardValue}>₹{averageBookingValue.toFixed(0)}</h3>
            <p className={styles.cardLabel}>Avg Booking Value</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>%</div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardValue}>{conversionRate}%</h3>
            <p className={styles.cardLabel}>Payment Success Rate</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Monthly Earnings */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Monthly Revenue Trend</h3>
            <p className={styles.chartSubtitle}>Earnings over time</p>
          </div>
          <div className={styles.chartWrapper}>
            <Bar data={monthlyData} options={monthlyOptions} />
          </div>
        </div>

        {/* Payment Status */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Payment Status</h3>
            <p className={styles.chartSubtitle}>Received vs Pending</p>
          </div>
          <div className={styles.chartWrapper}>
            <Doughnut data={paymentData} options={paymentOptions} />
          </div>
          <div className={styles.paymentStats}>
            <div className={styles.statItem}>
              <span className={styles.statDot} style={{ backgroundColor: "#4caf50" }}></span>
              <span>Received: ₹{receivedPayments.toLocaleString()}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statDot} style={{ backgroundColor: "#ff9800" }}></span>
              <span>Pending: ₹{pendingPayments.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Daily Trends */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Daily Performance</h3>
            <p className={styles.chartSubtitle}>Last 14 days</p>
          </div>
          <div className={styles.chartWrapper}>
            <Line data={dailyData} options={dailyOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Service Categories</h3>
            <p className={styles.chartSubtitle}>Revenue by category</p>
          </div>
          <div className={styles.chartWrapper}>
            <Doughnut data={categoryData} options={categoryOptions} />
          </div>
        </div>
      </div>

      {/* Top Helpers - Full Width */}
      <div className={styles.fullWidthCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Top Performing Helpers</h3>
          <p className={styles.chartSubtitle}>Highest earning service providers in this location</p>
        </div>
        <div className={styles.chartWrapper}>
          <Bar data={topHelpersData} options={topHelpersOptions} />
        </div>
      </div>
    </div>
  );
};

export default ModeratorEarnings;
