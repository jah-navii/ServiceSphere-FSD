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

  if (loading) return <p>Loading Analytics...</p>;
  if (!data) return <p>No data available.</p>;

  // --- CHART CONFIGURATIONS ---

  // 1. Monthly (Bar)
  const monthlyData = {
    labels: data.monthlyEarnings.map((e) => e.month),
    datasets: [
      {
        label: "Earnings (₹)",
        data: data.monthlyEarnings.map((e) => e.amount),
        backgroundColor: "rgba(0, 126, 167, 0.7)",
      },
    ],
  };

  // 2. Categories (Pie)
  const categoryData = {
    labels: data.categoryEarnings.map((e) => e.category),
    datasets: [
      {
        data: data.categoryEarnings.map((e) => e.amount),
        backgroundColor: ["#007ea7", "#00a7c4", "#00c7e6", "#009688", "#4caf50"],
      },
    ],
  };

  // 3. Daily Trends (Line)
  const dailyData = {
    labels: data.dailyTrends.map((e) => e.date),
    datasets: [
      {
        label: "Daily Earnings (₹)",
        data: data.dailyTrends.map((e) => e.amount),
        borderColor: "#007ea7",
        backgroundColor: "rgba(0, 126, 167, 0.2)",
        fill: true,
      },
    ],
  };

  // 4. Payment Status (Doughnut)
  const paymentData = {
    labels: ["Pending", "Received"],
    datasets: [
      {
        data: [data.paymentStatus.pending, data.paymentStatus.received],
        backgroundColor: ["#f44336", "#4caf50"],
      },
    ],
  };

  // 5. Top Helpers (Horizontal Bar)
  const topHelpersData = {
    labels: data.topHelpers.map((h) => h.name),
    datasets: [
      {
        label: "Earnings (₹)",
        data: data.topHelpers.map((h) => h.amount),
        backgroundColor: "rgba(0, 126, 167, 0.8)",
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Earnings Overview</h2>

      <div className={styles.grid}>
        {/* Monthly */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Monthly Earnings</h3>
          <div className={styles.canvasWrapper}>
            <Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Category */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Category-wise Earnings</h3>
          <div className={styles.canvasWrapper}>
            <Pie data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Daily Trends */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Daily Trends</h3>
          <div className={styles.canvasWrapper}>
            <Line data={dailyData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Payment Status */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Pending vs Received</h3>
          <div className={styles.canvasWrapper}>
            <Doughnut data={paymentData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Top Helpers (Full Width) */}
      <div className={styles.fullWidthCard}>
        <h3 className={styles.chartTitle}>Top-Earning Helpers</h3>
        <div className={styles.canvasWrapper}>
          <Bar 
            data={topHelpersData} 
            options={{ 
              indexAxis: 'y', // Horizontal Bar
              responsive: true, 
              maintainAspectRatio: false 
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;