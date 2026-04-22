import React, { useState, useEffect } from "react";
import { adminApi } from "../../utils/adminApi";
import { useToast } from "../../context/ToastContext";
import useConfirm from "../../hooks/useConfirm";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import styles from "./AdministratorFeedbacks.module.css";

const AdministratorFeedbacks = () => {
  const { showToast } = useToast();
  const { confirm, isOpen, message, handleYes, handleNo } = useConfirm();
  const [feedbacksData, setFeedbacksData] = useState({ feedbacks: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.feedbacks();
      setFeedbacksData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    const ok = await confirm("Are you sure you want to delete this feedback?");
    if (!ok) return;
    try {
      await adminApi.deleteFeedback(feedbackId);
      showToast("Feedback deleted successfully", "success");
      fetchFeedbacks();
    } catch (err) {
      showToast(`Error deleting feedback: ${err.message}`, "error");
    }
  };

  const getFilteredFeedbacks = () => {
    let feedbacks = feedbacksData.feedbacks || [];
    if (searchTerm) {
      feedbacks = feedbacks.filter(feedback =>
        (feedback.seeker?.name && feedback.seeker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.helper?.name && feedback.helper.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.feedback && feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterRating !== "all") {
      feedbacks = feedbacks.filter(feedback => feedback.rating === parseInt(filterRating));
    }
    return feedbacks;
  };

  const renderStars = (rating) => (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) return <LoadingSpinner message="Loading feedbacks..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchFeedbacks} />;

  const { stats } = feedbacksData;

  return (
    <>
    <ConfirmDialog isOpen={isOpen} message={message} onConfirm={handleYes} onCancel={handleNo} danger />
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Feedbacks & Reviews</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.total || 0}</div>
            <div className={styles.statLabel}>Total Feedbacks</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.averageRating || 0}</div>
            <div className={styles.statLabel}>Avg Rating</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.ratingDistribution?.[5] || 0}</div>
            <div className={styles.statLabel}>5-Star Reviews</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.ratingDistribution?.[1] || 0}</div>
            <div className={styles.statLabel}>1-Star Reviews</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by seeker, helper, or feedback text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      <div className={styles.feedbacksGrid}>
        {getFilteredFeedbacks().map((feedback) => (
          <div key={feedback._id} className={styles.feedbackCard}>
            <div className={styles.feedbackHeader}>
              <div className={styles.feedbackInfo}>
                <div className={styles.feedbackUsers}>
                  <span className={styles.seeker}>{feedback.seeker?.name || "Unknown Seeker"}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.helper}>{feedback.helper?.name || "Unknown Helper"}</span>
                </div>
                {feedback.helper?.category && (
                  <span className={styles.category}>{feedback.helper.category.name}</span>
                )}
              </div>
              <div className={styles.feedbackRating}>
                {renderStars(feedback.rating)}
                <span className={styles.ratingNumber}>{feedback.rating}/5</span>
              </div>
            </div>

            <div className={styles.feedbackText}>{feedback.feedback}</div>

            <div className={styles.feedbackFooter}>
              <span className={styles.feedbackDate}>{formatDate(feedback.date)}</span>
              <button className={styles.deleteBtn} onClick={() => handleDelete(feedback._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {getFilteredFeedbacks().length === 0 && (
          <div className={styles.noData}>No feedbacks found</div>
        )}
      </div>
    </div>
    </>
  );
};

export default AdministratorFeedbacks;
