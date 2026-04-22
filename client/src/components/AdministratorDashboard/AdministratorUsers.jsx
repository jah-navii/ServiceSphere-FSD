import React, { useState, useEffect } from "react";
import { adminApi } from "../../utils/adminApi";
import { useToast } from "../../context/ToastContext";
import useConfirm from "../../hooks/useConfirm";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import styles from "./AdministratorUsers.module.css";

const AdministratorUsers = () => {
  const [usersData, setUsersData] = useState({ helpers: [], seekers: [], moderators: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("helpers");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { showToast } = useToast();
  const { confirm, isOpen, message, handleYes, handleNo } = useConfirm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.users();
      setUsersData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSuspendUser = async (userType, userId, currentlySuspended) => {
    const action = currentlySuspended ? "unsuspend" : "suspend";
    const ok = await confirm(`Are you sure you want to ${action} this ${userType}?`);
    if (!ok) return;
    try {
      const data = await adminApi.suspendUser(userType, userId);
      showToast(
        `${userType.charAt(0).toUpperCase() + userType.slice(1)} ${data.data?.suspended ? "suspended" : "unsuspended"} successfully`,
        "success"
      );
      fetchUsers();
    } catch (err) {
      showToast(`Error updating user: ${err.message}`, "error");
    }
  };

  const handleApproveModerator = async (moderatorId) => {
    const ok = await confirm("Are you sure you want to approve this moderator?");
    if (!ok) return;
    try {
      await adminApi.approveModerator(moderatorId);
      showToast("Moderator approved successfully!", "success");
      fetchUsers();
    } catch (err) {
      showToast(`Error approving moderator: ${err.message}`, "error");
    }
  };

  const handleSuspendModerator = async (moderatorId) => {
    const ok = await confirm("Are you sure you want to suspend this moderator?");
    if (!ok) return;
    try {
      await adminApi.suspendModerator(moderatorId);
      showToast("Moderator suspended", "success");
      fetchUsers();
    } catch (err) {
      showToast(`Error suspending moderator: ${err.message}`, "error");
    }
  };

  const getFilteredUsers = () => {
    let users = usersData[activeTab] || [];
    if (searchTerm) {
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      if (activeTab === "helpers") {
        users = users.filter((u) => u.approved === (filterStatus === "approved"));
      } else if (activeTab === "moderators") {
        users = users.filter((u) => u.status === filterStatus);
      }
    }
    return users;
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchUsers} />;

  const filteredUsers = getFilteredUsers();

  return (
    <>
      <ConfirmDialog isOpen={isOpen} message={message} onConfirm={handleYes} onCancel={handleNo} />

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

        <div className={styles.tabs}>
          {["helpers", "seekers", "moderators"].map((tab) => (
            <button key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({usersData[tab]?.length || 0})
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <input type="text" className={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {activeTab === "helpers" && (
            <select className={styles.filterSelect} value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Helpers</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          )}
          {activeTab === "moderators" && (
            <select className={styles.filterSelect} value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Moderators</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          )}
        </div>

        <div className={styles.tableWrapper}>
          {filteredUsers.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th>
                  {activeTab === "helpers"    && <><th>Status</th><th>Location</th><th>Category</th></>}
                  {activeTab === "seekers"    && <th>Status</th>}
                  {activeTab === "moderators" && <><th>Status</th><th>Assigned Location</th></>}
                  <th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className={styles.nameCell}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.mobilenumber || user.phone || "N/A"}</td>
                    {activeTab === "helpers" && (
                      <>
                        <td>
                          <span className={`${styles.badge} ${user.suspended ? styles.suspended : user.approved ? styles.approved : styles.pending}`}>
                            {user.suspended ? "Suspended" : user.approved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td>{user.location?.name || user.address || "N/A"}</td>
                        <td>{user.category?.name || "N/A"}</td>
                      </>
                    )}
                    {activeTab === "moderators" && (
                      <>
                        <td>
                          <span className={`${styles.badge} ${user.status === "active" ? styles.approved : user.status === "pending" ? styles.pending : styles.suspended}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.assignedLocation?.name || "Not Assigned"}</td>
                      </>
                    )}
                    {activeTab === "seekers" && (
                      <td>
                        <span className={`${styles.badge} ${user.suspended ? styles.suspended : styles.approved}`}>
                          {user.suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                    )}
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {activeTab === "moderators" ? (
                        user.status === "pending" ? (
                          <button className={styles.approveBtn} onClick={() => handleApproveModerator(user._id)}>Approve</button>
                        ) : user.status === "active" ? (
                          <button className={styles.suspendBtn} onClick={() => handleSuspendModerator(user._id)}>Suspend</button>
                        ) : (
                          <span style={{ color: "#999", fontSize: "0.85rem" }}>Suspended</span>
                        )
                      ) : (
                        <button
                          className={user.suspended ? styles.approveBtn : styles.suspendBtn}
                          onClick={() => handleSuspendUser(activeTab, user._id, user.suspended)}>
                          {user.suspended ? "Unsuspend" : "Suspend"}
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
    </>
  );
};

export default AdministratorUsers;
