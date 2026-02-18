import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import styles from "./ManageUsers.module.css";

const ManageUsers = () => {
  const [helpers, setHelpers] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("helpers"); // 'helpers' or 'seekers'
  const { showToast } = useToast();

  // Fetch Helpers
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/users");
        const data = await res.json();
        if (Array.isArray(data)) {
          setHelpers(data);
        }
      } catch (err) {
        console.error("Error fetching helpers:", err);
        showToast("Failed to fetch helpers", "error");
      }
    };
    fetchHelpers();
  }, []);

  // Fetch Seekers
  useEffect(() => {
    const fetchSeekers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/seekers");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSeekers(data);
        }
      } catch (err) {
        console.error("Error fetching seekers:", err);
        showToast("Failed to fetch seekers", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSeekers();
  }, []);

  // Handle Approve/Reject for Helpers
  const handleStatusChange = async (helperId, action) => {
    try {
      const endpoint = action === "approve" ? "/approve" : "/reject";
      
      const res = await fetch(`http://localhost:5000/api/admin/users${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId }),
      });

      if (res.ok) {
        setHelpers(helpers.map(h => 
          h._id === helperId ? { ...h, approved: action === "approve" } : h
        ));
        showToast(`Helper ${action === "approve" ? "approved" : "rejected"} successfully`, "success");
      } else {
        showToast("Action failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  // Handle Delete Helper
  const handleDeleteHelper = async (helperId) => {
    if (!window.confirm("Are you sure you want to delete this helper? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/helper/${helperId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHelpers(helpers.filter(h => h._id !== helperId));
        showToast("Helper deleted successfully", "success");
      } else {
        showToast("Failed to delete helper", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  // Handle Delete Seeker
  const handleDeleteSeeker = async (seekerId) => {
    if (!window.confirm("Are you sure you want to delete this seeker? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/seeker/${seekerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSeekers(seekers.filter(s => s._id !== seekerId));
        showToast("Seeker deleted successfully", "success");
      } else {
        showToast("Failed to delete seeker", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>User Management</h1>
        <p className={styles.pageSubtitle}>Manage helper and seeker accounts</p>
      </div>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "helpers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("helpers")}
        >
          Helpers ({helpers.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "seekers" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("seekers")}
        >
          Seekers ({seekers.length})
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading users...</p>
      ) : (
        <>
          {/* Helpers Table */}
          {activeTab === "helpers" && (
            <div className={styles.tableWrapper}>
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
                    <tr><td colSpan="7" className={styles.noData}>No helpers found.</td></tr>
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
                          <div className={styles.actionBtns}>
                            {!helper.approved && (
                              <button 
                                className={`${styles.actionBtn} ${styles.approveBtn}`}
                                onClick={() => handleStatusChange(helper._id, "approve")}
                                title="Approve helper"
                              >
                                Approve
                              </button>
                            )}
                            {helper.approved && (
                              <button 
                                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                onClick={() => handleStatusChange(helper._id, "reject")}
                                title="Reject helper"
                              >
                                Reject
                              </button>
                            )}
                            <button 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDeleteHelper(helper._id)}
                              title="Delete helper"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Seekers Table */}
          {activeTab === "seekers" && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seekers.length === 0 ? (
                    <tr><td colSpan="5" className={styles.noData}>No seekers found.</td></tr>
                  ) : (
                    seekers.map(seeker => (
                      <tr key={seeker._id}>
                        <td>{seeker.name}</td>
                        <td>{seeker.email}</td>
                        <td>{seeker.mobilenumber}</td>
                        <td>{seeker.address}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDeleteSeeker(seeker._id)}
                              title="Delete seeker"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageUsers;