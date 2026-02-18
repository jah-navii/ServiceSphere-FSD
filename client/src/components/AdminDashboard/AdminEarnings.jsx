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
import styles from "./AdminEarnings.module.css";

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

const AdminEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/earnings-data");
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
  if (!data) return <div className={styles.error}>No data available.</div>;

  // Calculate summary metrics
  const totalEarnings = data.monthlyEarnings.reduce((sum, e) => sum + e.amount, 0);
  const totalBookings = data.dailyTrends.length;
  const averageBookingValue = totalBookings > 0 ? totalEarnings / totalBookings : 0;
  const pendingPayments = data.paymentStatus.pending || 0;
  const receivedPayments = data.paymentStatus.received || 0;
  const conversionRate = totalEarnings > 0 ? ((receivedPayments / totalEarnings) * 100).toFixed(1) : 0;

  // --- CHART CONFIGURATIONS ---

  // 1. Monthly Earnings (Bar)
  const monthlyData = {
    labels: data.monthlyEarnings.map((e) => e.month),
    datasets: [
      {
        label: "Earnings (₹)",
        data: data.monthlyEarnings.map((e) => e.amount),
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
    labels: data.categoryEarnings.map((e) => e.category),
    datasets: [
      {
        data: data.categoryEarnings.map((e) => e.amount),
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
    labels: data.dailyTrends.slice(-14).map((e) => e.date),
    datasets: [
      {
        label: "Daily Earnings (₹)",
        data: data.dailyTrends.slice(-14).map((e) => e.amount),
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
    labels: data.topHelpers.map((h) => h.name),
    datasets: [
      {
        label: "Earnings (₹)",
        data: data.topHelpers.map((h) => h.amount),
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
        <h1 className={styles.pageTitle}>Earnings Analytics</h1>
        <p className={styles.pageSubtitle}>Comprehensive financial overview and insights</p>
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
          <p className={styles.chartSubtitle}>Highest earning service providers</p>
        </div>
        <div className={styles.chartWrapper}>
          <Bar data={topHelpersData} options={topHelpersOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;