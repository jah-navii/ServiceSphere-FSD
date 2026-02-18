import React, { useState, useEffect } from "react";
import styles from "./ManageUsers.module.css";

const ManageUsers = () => {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/users");
        const data = await res.json();
        if (Array.isArray(data)) {
          setHelpers(data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle Approve/Reject
  const handleStatusChange = async (helperId, action) => {
    try {
      const endpoint = action === "approve" ? "/approve" : "/reject";
      
      const res = await fetch(`http://localhost:5000/api/admin/users${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId }),
      });

      if (res.ok) {
        // Optimistic UI update
        setHelpers(helpers.map(h => 
          h._id === helperId ? { ...h, approved: action === "approve" } : h
        ));
      } else {
        alert("Action failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>User Management</h1>
        <p className={styles.pageSubtitle}>Manage helper accounts and approvals</p>
      </div>
      
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Services</th>
              <th>Certification</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {helpers.length === 0 ? (
              <tr><td colspan="7">No helpers found.</td></tr>
            ) : (
              helpers.map(helper => (
                <tr key={helper._id}>
                  <td>{helper.name}</td>
                  <td>{helper.email}</td>
                  <td>{helper.mobilenumber}</td>
                  <td>
                    {helper.services && helper.services.length > 0 
                      ? helper.services.map(s => s.name).join(", ") 
                      : "None"}
                  </td>
                  <td>
                    {helper.certifications && helper.certifications.length > 0 ? (
                      <a 
                        href={`http://localhost:5000/uploads/${helper.certifications[0]}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.link}
                      >
                        View File
                      </a>
                    ) : "No File"}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${helper.approved ? styles.approved : styles.pending}`}>
                      {helper.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {!helper.approved && (
                      <button 
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleStatusChange(helper._id, "approve")}
                      >
                        Approve
                      </button>
                    )}
                    {helper.approved && (
                      <button 
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleStatusChange(helper._id, "reject")}
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;