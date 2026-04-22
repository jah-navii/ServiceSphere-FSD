import React, { useState, useEffect } from "react";
import { adminApi } from "../../utils/adminApi";
import { useToast } from "../../context/ToastContext";
import useConfirm from "../../hooks/useConfirm";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import styles from "./AdministratorModerators.module.css";

const AdministratorModerators = () => {
  const { showToast } = useToast();
  const { confirm, isOpen, message, handleYes, handleNo } = useConfirm();

  const [activeTab, setActiveTab] = useState("pending");
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [reasonModal, setReasonModal] = useState({ open: false, type: null, moderatorId: null });
  const [reasonText, setReasonText] = useState("");

  useEffect(() => {
    fetchModerators();
  }, [activeTab]);

  const fetchModerators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.moderatorApplications(activeTab);
      setModerators(data.data?.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (moderatorId) => {
    const ok = await confirm("Approve this moderator application?");
    if (!ok) return;
    setActionLoading(moderatorId);
    try {
      await adminApi.approveModerator(moderatorId);
      showToast("Moderator approved successfully!", "success");
      fetchModerators();
    } catch (err) {
      showToast(`Failed to approve moderator: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const openReasonModal = (type, moderatorId) => {
    setReasonModal({ open: true, type, moderatorId });
    setReasonText("");
  };

  const closeReasonModal = () => {
    setReasonModal({ open: false, type: null, moderatorId: null });
    setReasonText("");
  };

  const handleReasonSubmit = async () => {
    if (!reasonText.trim()) {
      showToast("Please enter a reason", "error");
      return;
    }
    const { type, moderatorId } = reasonModal;
    closeReasonModal();
    setActionLoading(moderatorId);
    try {
      if (type === "reject") {
        await adminApi.rejectModerator(moderatorId, { rejectionReason: reasonText });
        showToast("Moderator rejected", "success");
      } else if (type === "suspend") {
        await adminApi.suspendModerator(moderatorId, { suspensionReason: reasonText });
        showToast("Moderator suspended", "success");
      }
      fetchModerators();
    } catch (err) {
      showToast(`Failed to ${type} moderator: ${err.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading moderators..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchModerators} />;

  return (
    <>
    <ConfirmDialog isOpen={isOpen} message={message} onConfirm={handleYes} onCancel={handleNo} />

    {reasonModal.open && (
      <div className={styles.modalOverlay} onClick={closeReasonModal}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{reasonModal.type === "reject" ? "Rejection Reason" : "Suspension Reason"}</h2>
            <button className={styles.closeBtn} onClick={closeReasonModal}>×</button>
          </div>
          <div className={styles.modalBody}>
            <textarea
              className={styles.reasonInput}
              rows="4"
              placeholder={`Enter reason for ${reasonModal.type}...`}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.cancelBtn} onClick={closeReasonModal}>Cancel</button>
            <button
              className={reasonModal.type === "reject" ? styles.rejectBtn : styles.suspendBtn}
              onClick={handleReasonSubmit}
            >
              {reasonModal.type === "reject" ? "Reject" : "Suspend"}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Moderator Management</h1>
        <p className={styles.subtitle}>Review applications and manage location moderators</p>
      </div>

      <div className={styles.tabs}>
        {["pending", "active", "rejected", "suspended"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}{tab === "pending" ? " Applications" : tab === "active" ? " Moderators" : ""}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {moderators.length === 0 ? (
          <p className={styles.emptyMessage}>No {activeTab} moderators</p>
        ) : (
          <div className={styles.cardGrid}>
            {moderators.map((moderator) => (
              <div key={moderator._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{moderator.name}</h3>
                  <span className={`${styles.badge} ${styles[`${activeTab}Badge`]}`}>
                    {activeTab}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.info}><strong>Email:</strong> {moderator.email}</div>
                  <div className={styles.info}><strong>Phone:</strong> {moderator.phone}</div>
                  <div className={styles.info}>
                    <strong>Desired Location:</strong> {moderator.assignedLocation?.name || "N/A"}
                  </div>
                  {moderator.assignedLocation?.city && (
                    <div className={styles.info}>
                      <strong>City:</strong> {moderator.assignedLocation.city}, {moderator.assignedLocation.state}
                    </div>
                  )}
                  {moderator.experience && (
                    <div className={styles.info}><strong>Experience:</strong> {moderator.experience}</div>
                  )}
                  {moderator.linkedinProfile && (
                    <div className={styles.info}>
                      <strong>LinkedIn:</strong>{" "}
                      <a href={moderator.linkedinProfile} target="_blank" rel="noreferrer" className={styles.link}>
                        View Profile
                      </a>
                    </div>
                  )}
                  {moderator.resume && (
                    <div className={styles.info}>
                      <strong>Resume:</strong>{" "}
                      <a
                        href={`/uploads/${moderator.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.resumeLink}
                      >
                        View Resume (PDF)
                      </a>
                    </div>
                  )}
                  {moderator.coverLetter && (
                    <div className={styles.coverLetterBlock}>
                      <strong className={styles.coverLetterTitle}>Cover Letter</strong>
                      <p className={styles.coverLetterText}>{moderator.coverLetter}</p>
                    </div>
                  )}
                  <div className={styles.info}>
                    <strong>Applied:</strong> {new Date(moderator.createdAt).toLocaleDateString()}
                  </div>
                  {moderator.approvedDate && (
                    <div className={styles.info}>
                      <strong>Approved:</strong> {new Date(moderator.approvedDate).toLocaleDateString()}
                    </div>
                  )}
                  {moderator.rejectionReason && (
                    <div className={styles.info}><strong>Reason:</strong> {moderator.rejectionReason}</div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {activeTab === "pending" && (
                    <>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(moderator._id)}
                        disabled={actionLoading === moderator._id}
                      >
                        {actionLoading === moderator._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => openReasonModal("reject", moderator._id)}
                        disabled={actionLoading === moderator._id}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === "active" && (
                    <button
                      className={styles.suspendBtn}
                      onClick={() => openReasonModal("suspend", moderator._id)}
                      disabled={actionLoading === moderator._id}
                    >
                      {actionLoading === moderator._id ? "Processing..." : "Suspend"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AdministratorModerators;
