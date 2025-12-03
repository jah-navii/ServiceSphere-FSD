import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import styles from './RequestsPage.module.css';

function RequestsPage() {
  const { userData } = useOutletContext();
  const { showToast } = useToast();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Get Helper ID safely
  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  useEffect(() => {
    const fetchRequests = async () => {
      if (!helperId) return;

      try {
        // Match the Route: GET /api/helper/requests/:helperId
        const res = await fetch(`http://localhost:5000/api/helper/requests/${helperId}`);
        const data = await res.json();

        if (res.ok) {
          setRequests(data);
        } else {
          console.error("Failed to fetch requests");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [helperId]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // Match the Route: PATCH /api/helper/requests/update
      const res = await fetch(`http://localhost:5000/api/helper/requests/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        // Update UI locally
        setRequests(prev => 
          prev.map(req => 
            req._id === requestId ? { ...req, status: newStatus } : req
          )
        );
        showToast(`Request ${newStatus}`, "success");
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch (err) {
      console.error(err);
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
            {/* Note: Check your Booking model fields. Is it 'servicetype' or 'serviceType'? */}
            <h3>{request.servicetype || request.serviceName} Service</h3>
            
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
            
            {/* Status Display */}
            <p className={styles.infoRow}>
              <span className={styles.label}>Status:</span> 
              <span className={styles.status} style={{
                  color: request.status === 'Accepted' ? '#388e3c' : 
                         request.status === 'Rejected' ? '#d32f2f' : '#ffa000'
              }}>
                {request.status}
              </span>
            </p>
            
            {/* Action Buttons (Only for Pending) */}
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