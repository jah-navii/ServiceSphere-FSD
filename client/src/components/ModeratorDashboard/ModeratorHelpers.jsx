import React, { useState, useEffect } from "react";
import { moderatorApi } from "../../utils/moderatorApi";
import { useToast } from "../../context/ToastContext";
import useConfirm from "../../hooks/useConfirm";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import styles from "./ModeratorHelpers.module.css";

const TABS = ["applications", "active", "suspended"];
const TAB_LABELS = { applications: "Applications", active: "Active", suspended: "Suspended" };

const ModeratorHelpers = () => {
  const { showToast } = useToast();
  const { confirm, isOpen, message, handleYes, handleNo } = useConfirm();

  const [helpers, setHelpers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab]                     = useState("applications");
  const [search, setSearch]               = useState("");

  const [rejectModal, setRejectModal] = useState({ open: false, helperId: null });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { fetchHelpers(); }, []);

  const fetchHelpers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await moderatorApi.helpers();
      setHelpers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await moderatorApi.approveHelper(id);
      showToast("Helper approved successfully", "success");
      await fetchHelpers();
    } catch (err) {
      showToast(`Failed to approve: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectModal({ open: true, helperId: id });
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, helperId: null });
    setRejectReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      showToast("Please enter a rejection reason", "error");
      return;
    }
    const { helperId } = rejectModal;
    closeRejectModal();
    setActionLoading(helperId + "_reject");
    try {
      await moderatorApi.rejectHelper(helperId, { rejectionReason: rejectReason });
      showToast("Helper rejected", "success");
      await fetchHelpers();
    } catch (err) {
      showToast(`Failed to reject: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (id) => {
    const ok = await confirm("Suspend this helper? They will not be able to receive new bookings.");
    if (!ok) return;
    setActionLoading(id + "_suspend");
    try {
      await moderatorApi.suspendHelper(id);
      showToast("Helper suspended", "success");
      await fetchHelpers();
    } catch (err) {
      showToast(`Failed to suspend: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (id) => {
    setActionLoading(id + "_reactivate");
    try {
      await moderatorApi.reactivateHelper(id);
      showToast("Helper reactivated", "success");
      await fetchHelpers();
    } catch (err) {
      showToast(`Failed to reactivate: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading helpers..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchHelpers} />;

  const applications = helpers.filter(h => !h.approved && !h.suspended);
  const active       = helpers.filter(h =>  h.approved && !h.suspended);
  const suspended    = helpers.filter(h =>  h.suspended);

  const filterList = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(h =>
      h.name?.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.category?.name?.toLowerCase().includes(q)
    );
  };

  const counts = { applications: applications.length, active: active.length, suspended: suspended.length };
  const lists  = { applications: filterList(applications), active: filterList(active), suspended: filterList(suspended) };

  return (
    <>
    <ConfirmDialog isOpen={isOpen} message={message} onConfirm={handleYes} onCancel={handleNo} danger />

    {rejectModal.open && (
      <div className={styles.modalOverlay} onClick={closeRejectModal}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Rejection Reason</h2>
            <button className={styles.closeBtn} onClick={closeRejectModal}>×</button>
          </div>
          <div className={styles.modalBody}>
            <textarea
              className={styles.reasonInput}
              rows="4"
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelModalBtn} onClick={closeRejectModal}>Cancel</button>
            <button className={styles.rejectBtn} onClick={handleRejectSubmit}>Reject Helper</button>
          </div>
        </div>
      </div>
    )}

    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Helpers</h1>
          <p className={styles.subtitle}>Manage helpers in your location</p>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.hStat}><strong>{helpers.length}</strong> Total</span>
          <span className={styles.hStat}><strong>{counts.active}</strong> Active</span>
          {counts.applications > 0 && (
            <span className={`${styles.hStat} ${styles.hStatAlert}`}>
              <strong>{counts.applications}</strong> Pending
            </span>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
              <span className={`${styles.tabCount} ${tab === t ? styles.tabCountActive : ""}`}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, email or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.content}>
        {lists[tab].length === 0 ? (
          <div className={styles.empty}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>No {TAB_LABELS[tab].toLowerCase()} helpers{search ? " match your search" : ""}.</p>
          </div>
        ) : (
          <>
            {tab === "applications" && (
              <div className={styles.cardGrid}>
                {lists.applications.map(h => (
                  <div key={h._id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.avatar}>{h.name.charAt(0).toUpperCase()}</div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardName}>{h.name}</span>
                        <span className={styles.cardSub}>{h.category?.name || "No category"}</span>
                      </div>
                      <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
                    </div>
                    <div className={styles.cardBody}>
                      <Row label="Email"    val={h.email} />
                      <Row label="Phone"    val={h.mobilenumber || "—"} />
                      <Row label="Gender"   val={h.gender || "—"} />
                      <Row label="Services" val={h.services?.length ?? 0} />
                      <Row label="Applied"  val={h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(h._id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === h._id + "_approve" ? "Approving..." : "Approve"}
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => openRejectModal(h._id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === h._id + "_reject" ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "active" && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Helper</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Services</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lists.active.map(h => (
                      <tr key={h._id}>
                        <td>
                          <div className={styles.nameCell}>
                            <div className={styles.avatarSm}>{h.name.charAt(0).toUpperCase()}</div>
                            {h.name}
                          </div>
                        </td>
                        <td className={styles.muted}>{h.email}</td>
                        <td className={styles.muted}>{h.mobilenumber || "—"}</td>
                        <td>{h.category?.name || "—"}</td>
                        <td>{h.services?.length ?? 0}</td>
                        <td className={styles.muted}>
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td>
                          <button
                            className={styles.suspendBtn}
                            onClick={() => handleSuspend(h._id)}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === h._id + "_suspend" ? "Suspending..." : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "suspended" && (
              <div className={styles.cardGrid}>
                {lists.suspended.map(h => (
                  <div key={h._id} className={`${styles.card} ${styles.cardSuspended}`}>
                    <div className={styles.cardTop}>
                      <div className={`${styles.avatar} ${styles.avatarSuspended}`}>{h.name.charAt(0).toUpperCase()}</div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardName}>{h.name}</span>
                        <span className={styles.cardSub}>{h.category?.name || "No category"}</span>
                      </div>
                      <span className={`${styles.badge} ${styles.badgeSuspended}`}>Suspended</span>
                    </div>
                    <div className={styles.cardBody}>
                      <Row label="Email" val={h.email} />
                      <Row label="Phone" val={h.mobilenumber || "—"} />
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.reactivateBtn}
                        onClick={() => handleReactivate(h._id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === h._id + "_reactivate" ? "Reactivating..." : "Reactivate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};

const Row = ({ label, val }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid #f7fafc", fontSize: "0.84rem" }}>
    <span style={{ color: "#718096", fontWeight: 600 }}>{label}</span>
    <span style={{ color: "#2d3748" }}>{val}</span>
  </div>
);

export default ModeratorHelpers;
