import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { helperApi } from '../../utils/helperApi';
import styles from './RequestsPage.module.css';

function RequestsPage() {
  const { userData } = useOutletContext();
  const { showToast } = useToast();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  // To fetch pending requests from the backend
  useEffect(() => {
    const fetchRequests = async () => {
      if (!helperId) return;

      try {
        const data = await helperApi.requests(helperId);
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [helperId]);

  // Handling Accept and Reject Buttons
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const data = await helperApi.updateRequest({ requestId, status: newStatus });
      if (data.success) {
        setRequests(prev =>
          prev.map(req => req._id === requestId ? { ...req, status: newStatus } : req)
        );
        showToast(`Request ${newStatus}`, "success");
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  if (loading) return <p style={{padding:'20px'}}>Loading requests...</p>;

  return (
    <div className={styles.list}>
      {requests.length === 0 ? (
        <p className={styles.emptyMsg}>No service requests found.</p>
      ) : (
        requests.map(request => (
          <div className={styles.card} key={request._id}>
            <h3>{request.service_type || request.serviceName} Service</h3>
            
            <p className={styles.infoRow}>
              <span className={styles.label}>Customer:</span> {request.customerName}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Date:</span> {new Date(request.date).toLocaleDateString()} at {request.time}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Address:</span> {request.address}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Price:</span> ₹{request.price}
            </p>
            <p className={styles.infoRow}>
              <span className={styles.label}>Status:</span> 
              <span 
                className={styles.status} 
                style={{
                  color: request.status === 'Accepted' ? '#388e3c' : 
                         request.status === 'Rejected' ? '#d32f2f' : '#ffa000'
                }}
              >
                {request.status}
              </span>
            </p>
            
            {request.status === 'Pending' && (
              <div className={styles.actions}>
                <button 
                  className={styles.acceptBtn} 
                  onClick={() => handleStatusUpdate(request._id, 'Accepted')}
                >
                  Accept
                </button>
                <button 
                  className={styles.rejectBtn} 
                  onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default RequestsPage;