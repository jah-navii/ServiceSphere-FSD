import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorUsers.module.css";

const AdministratorUsers = () => {
  const [usersData, setUsersData] = useState({ helpers: [], seekers: [], moderators: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("helpers");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/users/all");
      setUsersData(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userType, userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/api/administrator/users/${userType}/${userId}`);
      alert("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
      console.error("Delete Error:", err);
    }
  };

  const handleApproveModerator = async (moderatorId) => {
    if (!window.confirm('Are you sure you want to approve this moderator?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/administrator/moderator-applications/${moderatorId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Moderator approved successfully!');
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve moderator');
      }
    } catch (err) {
      alert(`Error approving moderator: ${err.message}`);
    }
  };

  const handleSuspendModerator = async (moderatorId) => {
    if (!window.confirm('Are you sure you want to suspend this moderator?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/administrator/moderators/${moderatorId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Moderator suspended');
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to suspend moderator');
      }
    } catch (err) {
      alert(`Error suspending moderator: ${err.message}`);
    }
  };

  const getFilteredUsers = () => {
    let users = usersData[activeTab] || [];

    // Apply search filter
    if (searchTerm) {
      users = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (activeTab === "helpers") {
        users = users.filter((user) => user.approved === (filterStatus === "approved"));
      } else if (activeTab === "moderators") {
        users = users.filter((user) => user.status === filterStatus);
      }
    }

    return users;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>All Platform Users</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{usersData.helpers?.length || 0}</span>
            <span className={styles.statLabel}>Helpers</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{usersData.seekers?.length || 0}</span>
            <span className={styles.statLabel}>Seekers</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{usersData.moderators?.length || 0}</span>
            <span className={styles.statLabel}>Moderators</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "helpers" ? styles.active : ""}`}
          onClick={() => setActiveTab("helpers")}
        >
          Helpers ({usersData.helpers?.length || 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "seekers" ? styles.active : ""}`}
          onClick={() => setActiveTab("seekers")}
        >
          Seekers ({usersData.seekers?.length || 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "moderators" ? styles.active : ""}`}
          onClick={() => setActiveTab("moderators")}
        >
          Moderators ({usersData.moderators?.length || 0})
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === "helpers" && (
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Helpers</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        )}
        {activeTab === "moderators" && (
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Moderators</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        )}
      </div>

      {/* Users Table */}
      <div className={styles.tableWrapper}>
        {filteredUsers.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                {activeTab === "helpers" && <th>Status</th>}
                {activeTab === "helpers" && <th>Location</th>}
                {activeTab === "helpers" && <th>Category</th>}
                {activeTab === "moderators" && <th>Status</th>}
                {activeTab === "moderators" && <th>Assigned Location</th>}
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className={styles.nameCell}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.mobilenumber || user.phone || "N/A"}</td>
                  {activeTab === "helpers" && (
                    <td>
                      <span
                        className={`${styles.badge} ${
                          user.approved ? styles.approved : styles.pending
                        }`}
                      >
                        {user.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                  )}
                  {activeTab === "helpers" && (
                    <td>{user.location?.name || user.address || "N/A"}</td>
                  )}
                  {activeTab === "helpers" && (
                    <td>{user.category?.name || "N/A"}</td>
                  )}
                  {activeTab === "moderators" && (
                    <td>
                      <span
                        className={`${styles.badge} ${
                          user.status === "active" ? styles.approved : 
                          user.status === "pending" ? styles.pending : 
                          styles.suspended
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  )}
                  {activeTab === "moderators" && (
                    <td>{user.assignedLocation?.name || "Not Assigned"}</td>
                  )}
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {activeTab === "moderators" ? (
                      user.status === "pending" ? (
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApproveModerator(user._id)}
                        >
                          Approve
                        </button>
                      ) : user.status === "active" ? (
                        <button
                          className={styles.suspendBtn}
                          onClick={() => handleSuspendModerator(user._id)}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteUser(activeTab, user._id)}
                        >
                          Delete
                        </button>
                      )
                    ) : (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteUser(activeTab, user._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noData}>
            No {activeTab} found{searchTerm ? " matching your search" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdministratorUsers;
