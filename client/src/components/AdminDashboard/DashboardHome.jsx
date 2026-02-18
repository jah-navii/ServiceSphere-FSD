import React, { useState, useEffect } from "react";
import styles from "./DashboardHome.module.css";

const DashboardHome = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/messages");
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Remove from local state immediately
        setMessages(messages.filter((msg) => msg._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Contact Messages</h1>
        <p className={styles.pageSubtitle}>Manage and respond to user inquiries</p>
      </div>
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg._id}>
                <td>{msg.name}</td>
                <td>{msg.email}</td>
                <td>{msg.message}</td>
                <td>{new Date(msg.submittedAt).toLocaleString()}</td>
                <td>
                  <button 
                    className={`${styles.actionBtn} ${styles.reply}`}
                    onClick={() => handleReply(msg.email)}
                  >
                    Reply
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.delete}`}
                    onClick={() => handleDelete(msg._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DashboardHome;